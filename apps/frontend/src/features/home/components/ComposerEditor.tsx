"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import {
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
  autoLinkUrlMatcher,
} from "@lexical/link"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"
import { $findMatchingParent } from "@lexical/utils"
import purify from "dompurify"
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $setSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type BaseSelection,
  type LexicalEditor,
  type TextFormatType,
} from "lexical"
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const EDITOR_NODES = [ListNode, ListItemNode, LinkNode, AutoLinkNode]

const LINK_MATCHERS = [autoLinkUrlMatcher]

const LINK_ATTRIBUTES = {
  rel: "noopener noreferrer",
  target: "_blank",
}

const composerTheme = {
  paragraph: "composer-paragraph",
  text: {
    bold: "composer-text-bold",
    italic: "composer-text-italic",
    underline: "composer-text-underline",
    strikethrough: "composer-text-strikethrough",
    underlineStrikethrough: "composer-text-underline-strikethrough",
    code: "composer-text-code",
  },
  link: "composer-link",
  list: {
    ul: "composer-list-ul",
    ol: "composer-list-ol",
    listitem: "composer-listitem",
  },
}

const FORMAT_OPTIONS: Array<{ format: TextFormatType; label: string; icon: typeof Bold }> = [
  { format: "bold", label: "Bold", icon: Bold },
  { format: "italic", label: "Italic", icon: Italic },
  { format: "underline", label: "Underline", icon: Underline },
  { format: "strikethrough", label: "Strikethrough", icon: Strikethrough },
  { format: "code", label: "Code", icon: Code },
]

function onError(error: Error) {
  console.error(error)
  throw error
}

const initialConfig = {
  namespace: "PostComposer",
  theme: composerTheme,
  onError,
  nodes: EDITOR_NODES,
}

export type ComposerContent = {
  html: string
  text: string
}

export type ComposerEditorHandle = {
  getContent: () => ComposerContent
  clear: () => void
}

function sanitizePostHtml(html: string) {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "code",
      "span",
    ],
    ALLOWED_ATTR: ["href", "rel", "target"],
  })
}

function isAllowedUrl(url: string) {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    )
  } catch {
    return false
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^(https?:|mailto:)/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  return isAllowedUrl(withProtocol) ? withProtocol : null
}

function readPostContent(editor: LexicalEditor): ComposerContent {
  return editor.read(() => ({
    html: sanitizePostHtml($generateHtmlFromNodes(editor, null)),
    text: $getRoot().getTextContent(),
  }))
}

function $currentListKind(): "bullet" | "number" | null {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return null
  const anchor = selection.anchor.getNode()
  const item = $isListItemNode(anchor)
    ? anchor
    : $findMatchingParent(anchor, $isListItemNode)
  const parent = item?.getParent()
  if (!$isListNode(parent)) return null
  const kind = parent.getListType()
  return kind === "number" || kind === "bullet" ? kind : null
}

function $selectionIsLink() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return false
  const node = selection.anchor.getNode()
  return Boolean($isLinkNode(node) || $findMatchingParent(node, $isLinkNode))
}

function InitialHtmlPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!html?.trim()) return

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(sanitizePostHtml(html), "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      const blocks =
        nodes.length === 0
          ? [$createParagraphNode()]
          : nodes.map((node) => {
              if ($isElementNode(node)) return node
              const paragraph = $createParagraphNode()
              paragraph.append(node)
              return paragraph
            })
      root.append(...blocks)
    })
  }, [editor, html])

  return null
}

function EditorHandlePlugin({
  handleRef,
}: {
  handleRef: RefObject<ComposerEditorHandle | null>
}) {
  const [editor] = useLexicalComposerContext()

  handleRef.current = {
    getContent: () => readPostContent(editor),
    clear: () => {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        root.append(paragraph)
        paragraph.select()
      })
    },
  }

  return null
}

function HtmlChangePlugin({
  onChange,
}: {
  onChange?: (content: ComposerContent) => void
}) {
  const [editor] = useLexicalComposerContext()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  return (
    <OnChangePlugin
      ignoreSelectionChange
      onChange={() => {
        onChangeRef.current?.(readPostContent(editor))
      }}
    />
  )
}

function SubmitOnModEnterPlugin({ onSubmit }: { onSubmit?: () => void }) {
  const [editor] = useLexicalComposerContext()
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) {
          return false
        }
        event.preventDefault()
        onSubmitRef.current?.()
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const savedSelection = useRef<BaseSelection | null>(null)
  const [formats, setFormats] = useState<Set<TextFormatType>>(() => new Set())
  const [listKind, setListKind] = useState<"bullet" | "number" | null>(null)
  const [isLink, setIsLink] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)

  const syncSelection = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection()
      const next = new Set<TextFormatType>()
      if ($isRangeSelection(selection)) {
        for (const { format } of FORMAT_OPTIONS) {
          if (selection.hasFormat(format)) next.add(format)
        }
      }
      setFormats((current) =>
        current.size === next.size &&
        [...next].every((format) => current.has(format))
          ? current
          : next,
      )
      setListKind($currentListKind())
      setIsLink($selectionIsLink())
    })
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncSelection()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, syncSelection])

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      syncSelection()
    })
  }, [editor, syncSelection])

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (next) => {
        setCanUndo(next)
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (next) => {
        setCanRedo(next)
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
    return () => {
      unregisterUndo()
      unregisterRedo()
    }
  }, [editor])

  const applyLink = (url: string) => {
    editor.update(() => {
      const saved = savedSelection.current
      if (saved) $setSelection(saved)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    })
    setLinkOpen(false)
  }

  return (
    <div data-slot="composer-toolbar" role="toolbar" aria-label="Formatting">
      <ToolbarButton
        label="Undo"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 />
      </ToolbarButton>
      <span data-slot="composer-toolbar-sep" aria-hidden />
      {FORMAT_OPTIONS.map(({ format, label, icon: Icon }) => (
        <ToolbarButton
          key={format}
          label={label}
          pressed={formats.has(format)}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
        >
          <Icon />
        </ToolbarButton>
      ))}
      <span data-slot="composer-toolbar-sep" aria-hidden />
      <ToolbarButton
        label="Bulleted list"
        pressed={listKind === "bullet"}
        onClick={() => toggleList(editor, "bullet")}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        pressed={listKind === "number"}
        onClick={() => toggleList(editor, "number")}
      >
        <ListOrdered />
      </ToolbarButton>
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={isLink ? "secondary" : "ghost"}
            size="icon-xs"
            aria-label={isLink ? "Remove link" : "Link"}
            aria-pressed={isLink}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              let collapsed = false
              let linked = false
              editor.read(() => {
                const selection = $getSelection()
                linked = $selectionIsLink()
                collapsed =
                  !$isRangeSelection(selection) || selection.isCollapsed()
                savedSelection.current = $isRangeSelection(selection)
                  ? selection.clone()
                  : null
              })
              if (linked) {
                event.preventDefault()
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
                return
              }
              if (collapsed) {
                event.preventDefault()
                toast.error("Select the text you want to link.")
              }
            }}
          >
            <Link2 />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const input = new FormData(event.currentTarget).get("url")
              const url = normalizeUrl(typeof input === "string" ? input : "")
              if (!url) {
                toast.error("Enter a valid URL.")
                return
              }
              applyLink(url)
            }}
          >
            <Input name="url" placeholder="https://example.com" autoFocus />
            <Button type="submit" size="sm">
              Add link
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function toggleList(editor: LexicalEditor, kind: "bullet" | "number") {
  let current: "bullet" | "number" | null = null
  editor.read(() => {
    current = $currentListKind()
  })
  if (current === kind) {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    return
  }
  editor.dispatchCommand(
    kind === "number" ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
    undefined,
  )
}

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={pressed ? "secondary" : "ghost"}
      size="icon-xs"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function ComposerEditor({
  placeholder,
  initialHtml,
  onChange,
  onSubmit,
  editorRef,
}: {
  placeholder: string
  initialHtml?: string
  onChange?: (content: ComposerContent) => void
  onSubmit?: () => void
  editorRef?: RefObject<ComposerEditorHandle | null>
}) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div data-slot="composer-editor">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              data-slot="composer-input"
              aria-placeholder={placeholder}
              placeholder={
                <span data-slot="composer-placeholder">{placeholder}</span>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin validateUrl={isAllowedUrl} attributes={LINK_ATTRIBUTES} />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        <InitialHtmlPlugin html={initialHtml} />
        <HtmlChangePlugin onChange={onChange} />
        <SubmitOnModEnterPlugin onSubmit={onSubmit} />
        {editorRef ? <EditorHandlePlugin handleRef={editorRef} /> : null}
      </div>
      <ToolbarPlugin />
    </LexicalComposer>
  )
}

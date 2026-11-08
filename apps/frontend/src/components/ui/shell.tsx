import * as React from "react"

function Shell({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="shell" {...props} />
}

function ShellColumns({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="shell-columns" {...props} />
}

function ShellNav({ ...props }: React.ComponentProps<"aside">) {
  return <aside data-slot="shell-nav" {...props} />
}

function ShellFeed({ ...props }: React.ComponentProps<"section">) {
  return <section data-slot="shell-feed" {...props} />
}

function ShellRail({ ...props }: React.ComponentProps<"aside">) {
  return <aside data-slot="shell-rail" {...props} />
}

function ShellMobileBar({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="shell-mobile-bar" {...props} />
}

function ColumnHeader({ ...props }: React.ComponentProps<"header">) {
  return <header data-slot="column-header" {...props} />
}

function PublicFrame({ ...props }: React.ComponentProps<"main">) {
  return <main data-slot="public" {...props} />
}

function PublicColumn({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="public-column" {...props} />
}

export {
  Shell,
  ShellColumns,
  ShellNav,
  ShellFeed,
  ShellRail,
  ShellMobileBar,
  ColumnHeader,
  PublicFrame,
  PublicColumn,
}

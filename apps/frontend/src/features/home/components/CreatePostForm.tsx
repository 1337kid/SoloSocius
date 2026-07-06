import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PencilIcon } from "lucide-react";
import { useCreatePost } from "../hooks/useHomeFeed";
import { toast } from "sonner";

const CreatePostForm = () => {
  const [content, setContent] = useState("");

  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  const handleCreatePost = () => {
    if (!content.trim()) {
      toast.error("Please enter a post");
      return;
    }
    createPost(
      { content },
      {
        onSuccess: () => {
          toast.success("Post created successfully");
          setContent("");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardContent>
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="What's on your mind?"
            className="w-full"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleCreatePost}
            disabled={isCreatingPost}
          >
            {isCreatingPost ? (
              <Loader2 className="size-4 mr-2" />
            ) : (
              <PencilIcon className="size-4 mr-2" />
            )}
            Create Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;

import { cn } from "@/lib/utils";
import { useIsThreadActive } from "@liveblocks/react-lexical";
import { Composer, Thread } from "@liveblocks/react-ui";
import { useThreads } from "@liveblocks/react/suspense";
import React from "react";

function ThreadWrapper({ thread }: ThreadWrapperProps) {
  const isActive = useIsThreadActive(thread.id);
  return (
    <Thread
      thread={thread}
      data-state={isActive ? "active" : null}
      className={cn(
        "comment-thread border",
        isActive && "!border-blue-500 shadow-md",
        thread.resolved && "opacity-40"
      )}
    />
  );
}

const Comments = () => {
  const { threads } = useThreads();

  // Sort threads by their last updated timestamp in descending order
  const sortedThreads = [...threads].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="comments-container rounded-lg p-4 h-fit">
      <Composer className="comment-composer"/>
      {sortedThreads.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  );
};

export default Comments;
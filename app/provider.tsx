"use client";
import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.action";
import { useUser } from "@clerk/nextjs";
import {
  ClientSideSuspense,
  LiveblocksProvider
} from "@liveblocks/react/suspense";
import { ReactNode } from "react";

const provider = ({ children }: { children: ReactNode }) => {
   const { user: clerkUser } = useUser();
  return (
    <LiveblocksProvider
      resolveUsers={async ({ userIds }) => {
        const user = await getClerkUsers({ userIds });
        return user;
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: clerkUser.emailAddresses[0].emailAddress!,
          text
        });
        return roomUsers;
      }}
      authEndpoint="/api/liveblocks-auth"
    >
      <ClientSideSuspense fallback={<Loader />}>{children}</ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default provider;

"use client";
import React, { useEffect, useRef, useState } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import Loader from "./Loader";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setdocumentTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        if (documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);
          if (updateDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        if (documentTitle !== roomMetadata.title) {
          updateDocument(roomId, documentTitle);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [documentTitle, roomId, roomMetadata]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div>
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loader />}>
          <div className="collaborative-room">
            <Header>
              <div
                ref={containerRef}
                className="flex w-fit items-center justify-center gap-2"
              >
                {editing && !loading ? (
                  <Input
                    ref={inputRef}
                    type="text"
                    value={documentTitle}
                    placeholder="Enter Title"
                    onChange={(e) => setdocumentTitle(e.target.value)}
                    onKeyDown={updateTitleHandler}
                    disabled={!editing}
                    className="document-title-input"
                  />
                ) : (
                  <p className="documnet-title">{documentTitle}</p>
                )}

                {currentUserType === "editor" && !editing && (
                  <Image
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={24}
                    height={24}
                    onClick={() => setEditing(true)}
                    className="pointer"
                  />
                )}

                {currentUserType !== "editor" && !editing && (
                  <p className="view-only-tag">View Only</p>
                )}
                {loading && <p className="text-sm text-gray-400">Saving...</p>}
              </div>
              <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
                <ActiveCollaborators />
                <ShareModal roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
                />
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </Header>
            <Editor roomId={roomId} currentUserType={currentUserType} />
          </div>
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
};

export default CollaborativeRoom;

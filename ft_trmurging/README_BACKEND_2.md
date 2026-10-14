The API examples use `http://localhost:3000` as the base URL. Change it
to match your server's configured port.

## Groups

All routes below are mounted at `/api/groups` and require
authentication.

### Create a group

`POST /api/groups`

Creates a group, adds the authenticated user as its owner, creates a
conversation for the group, and stores the conversation ID on the group.

**Request body**

``` json
{
  "name": "Weekend Trip"
}
```

**Success --- `201 Created`**

``` json
{
  "message": "Group created successfully",
  "group": {
    "_id": "GROUP_ID",
    "name": "Weekend Trip",
    "createdBy": "USER_ID",
    "members": [
      {
        "userId": "USER_ID",
        "role": "owner",
        "joinedAt": "DATE"
      }
    ],
    "conversationId": "CONVERSATION_ID"
  },
  "conversation": {
    "_id": "CONVERSATION_ID",
    "participants": ["USER_ID"]
  }
}
```

**Possible errors:** `400` if the group name is missing or blank.

### Add a member

`POST /api/groups/:groupId/members`

Only the group owner can add an existing user. The user is added to both
the group's member list and its conversation participants.

**Path parameter:** `groupId` --- the group ID.

**Request body**

``` json
{
  "userId": "USER_ID_TO_ADD"
}
```

**Success --- `200 OK`**

``` json
{
  "message": "Member added successfully",
  "group": {}
}
```

**Possible errors:** `400` invalid user ID; `403` caller is not the
owner; `404` group or user not found; `409` user is already a member.

### Remove a member

`DELETE /api/groups/:groupId/members/:userId`

Only the owner can remove a member. The group owner cannot be removed.
The member is also removed from the conversation participants.

**Path parameters:** `groupId`, `userId` --- group and member IDs.

**Success --- `200 OK`**

``` json
{
  "message": "Member removed successfully",
  "group": {}
}
```

**Possible errors:** `400` invalid ID or attempted owner removal; `403`
caller is not the owner; `404` group or membership not found.

### Get the current user's groups

`GET /api/groups/me`

Returns groups in which the authenticated user is a member, newest
first.

**Success --- `200 OK`**

``` json
{
  "count": 1,
  "groups": []
}
```

### Get a group by ID

`GET /api/groups/:groupId`

Returns group details only if the authenticated user is a member. The
controller populates `createdBy` and `members.userId`.

**Success --- `200 OK`**

``` json
{
  "group": {}
}
```

**Possible errors:** `400` invalid group ID; `403` caller is not a
member; `404` group not found.

### Leave a group

`DELETE /api/groups/:groupId/leave`

Removes the authenticated user from the group and its conversation
participants. The owner cannot leave.

**Success --- `200 OK`**

``` json
{
  "message": "You left the group successfully"
}
```

**Possible errors:** `400` owner attempted to leave or invalid group ID;
`403` caller is not a member; `404` group not found.

### Update a group

`PATCH /api/groups/:groupId`

Only the owner can update the group name.

**Request body**

``` json
{
  "name": "Updated Group Name"
}
```

**Success --- `200 OK`**

``` json
{
  "message": "Group updated successfully",
  "group": {}
}
```

**Possible errors:** `400` invalid group ID or missing/blank name; `403`
caller is not the owner; `404` group not found.

### Delete a group

`DELETE /api/groups/:groupId`

Only the owner can delete the group. The controller deletes its
messages, conversation, group invitations and invitation-related
notifications, then deletes the group.

**Success --- `200 OK`**

``` json
{
  "message": "Group deleted successfully"
}
```

**Possible errors:** `400` invalid group ID; `403` caller is not the
owner; `404` group not found.

## Group invitations

All routes below are mounted at `/api/group-invitations` and require
authentication.

### Send an invitation

`POST /api/group-invitations/:groupId`

Only the group owner can invite an existing user who is not already a
member and has no pending invitation. A `GROUP_INVITATION` notification
is created and emitted through Socket.IO when `io` is configured.

**Path parameter:** `groupId`.

**Request body**

``` json
{
  "userId": "USER_ID_TO_INVITE"
}
```

**Success --- `201 Created`**

``` json
{
  "message": "Group invitation sent successfully",
  "invitation": {
    "_id": "INVITATION_ID",
    "groupId": "GROUP_ID",
    "invitedUserId": "USER_ID",
    "invitedBy": "OWNER_ID",
    "status": "pending"
  }
}
```

**Possible errors:** `400` invalid IDs or self-invitation; `403` caller
is not the owner; `404` group or user not found; `409` already a member
or a pending invitation exists.

### Accept an invitation

`PATCH /api/group-invitations/:invitationId/accept`

Only the invited user can accept a pending invitation. The controller
adds them to the group and conversation participants, then sets the
invitation status to `accepted`.

**Success --- `200 OK`**

``` json
{
  "message": "Invitation accepted successfully",
  "group": {}
}
```

**Possible errors:** `400` invalid ID or invitation is not pending;
`403` caller is not the invited user; `404` invitation or group not
found.

### Reject an invitation

`PATCH /api/group-invitations/:invitationId/reject`

Only the invited user can reject a pending invitation. The status is
changed to `rejected`.

**Success --- `200 OK`**

``` json
{
  "message": "Invitation rejected successfully"
}
```

**Possible errors:** `400` invalid ID or invitation is not pending;
`403` caller is not the invited user; `404` invitation not found.

## Friends

All routes below are mounted at `/api/friends` and require
authentication.

### Send a friend request

`POST /api/friends/request`

Creates a pending friendship request and sends a `FRIEND_REQUEST`
notification to the receiver. A previously rejected request is reused
and reset to `PENDING`.

**Request body**

``` json
{
  "receiverId": "USER_ID_TO_ADD"
}
```

**Success --- `201 Created`**

``` json
{
  "message": "Friend request sent",
  "friendship": {
    "_id": "FRIENDSHIP_ID",
    "requester": "CURRENT_USER_ID",
    "receiver": "USER_ID_TO_ADD",
    "status": "PENDING"
  }
}
```

For a previously rejected request, the controller returns `200 OK` with
`"Friend request sent again"`.

**Possible errors:** `400` missing/invalid ID or self-request; `404`
user not found; `409` request already exists or users are already
friends.

### Accept a friend request

`PATCH /api/friends/request/:friendshipId/accept`

The authenticated user must be the receiver of a pending request.

**Success --- `200 OK`**

``` json
{
  "message": "Friend request accepted",
  "friendship": {}
}
```

**Possible errors:** `404` no matching pending request for the current
user.

### Reject a friend request

`PATCH /api/friends/request/:friendshipId/reject`

The authenticated user must be the receiver of a pending request.

**Success --- `200 OK`**

``` json
{
  "message": "Friend request rejected",
  "friendship": {}
}
```

**Possible errors:** `404` no matching pending request for the current
user.

### List friends

`GET /api/friends`

Returns accepted friendships, populated with each friend's `username`
and `email`.

**Success --- `200 OK`**

``` json
{
  "friends": []
}
```

### List incoming friend requests

`GET /api/friends/requests`

Returns pending requests received by the authenticated user, with the
requester populated with `username` and `email`.

**Success --- `200 OK`**

``` json
{
  "requests": []
}
```

### Remove a friend

`DELETE /api/friends`

**Request body**

``` json
{
  "friendId": "FRIEND_USER_ID"
}
```

Deletes the accepted friendship between the authenticated user and
`friendId`.

**Success --- `200 OK`**

``` json
{
  "message": "Friend removed successfully"
}
```

**Possible errors:** `400` missing/invalid ID or self-removal; `404`
friendship not found.

## Notifications

All routes below are mounted at `/api/notifications` and require
authentication. Each operation is scoped to the authenticated user's
notifications.

### List notifications

`GET /api/notifications`

Returns the current user's notifications, newest first, with the sender
populated with `username`.

**Success --- `200 OK`**

``` json
[]
```

### Mark a notification as read

`PATCH /api/notifications/:notificationId/read`

**Success --- `200 OK`**

Returns the updated notification document, with `isRead: true`.

**Possible errors:** `404` notification not found for the current user.

### Delete one notification

`DELETE /api/notifications/:id`

Deletes a notification belonging to the current user.

**Success --- `200 OK`**

``` json
{
  "message": "Notification deleted successfully"
}
```

**Possible errors:** `404` notification not found for the current user.

### Clear all notifications

`DELETE /api/notifications/user/all`

Deletes all notifications belonging to the current user.

**Success --- `200 OK`**

``` json
{
  "message": "All notifications deleted",
  "deletedCount": 3
}
```

## Conversations and group chat messages

Both routers are mounted at `/api/conversations`. The current code
includes conversation-creation/list endpoints as well as group-message
endpoints. Since the intended product has group chats only, review
whether the standalone conversation endpoints should remain enabled.

### Create a conversation (current implementation)

`POST /api/conversations`

**Request body**

``` json
{
  "userId": "OTHER_USER_ID"
}
```

Creates a conversation with the authenticated user and the supplied user
ID.

**Success --- `201 Created`**

Returns the created conversation document, including its `_id` and
`participants`.

**Possible errors:** `400` user ID missing or equal to the current
user's ID.

> Note: this endpoint currently permits standalone two-user
> conversations and does not fully validate the supplied ID or verify
> that the other user exists. It may not fit a group-chat-only design.

### List conversations (current implementation)

`GET /api/conversations`

Returns conversation documents where the authenticated user appears in
`participants`, sorted by most recently updated first.

**Success --- `200 OK`**

``` json
[]
```

### Send a message

`POST /api/conversations/:conversationId/messages`

The authenticated user must be a participant in the conversation.
Creates a message, creates a `CHAT_MESSAGE` notification for each other
participant, and emits `newNotification` to each user's Socket.IO room
and `newMessage` to the conversation room when Socket.IO is configured.

**Request body**

``` json
{
  "content": "Hello everyone!"
}
```

**Success --- `201 Created`**

Returns the created message with `senderId` populated with `_id` and
`username`.

**Possible errors:** `400` blank/missing content or invalid conversation
ID; `403` caller is not a participant; `404` conversation not found.

### Get messages

`GET /api/conversations/:conversationId/messages`

The authenticated user must be a participant. Returns messages for that
conversation in ascending `createdAt` order, with `senderId` populated
with `_id` and `username`.

**Success --- `200 OK`**

``` json
[]
```

**Possible errors:** `400` invalid conversation ID; `403` caller is not
a participant; `404` conversation not found.
import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { channelHeader } from "./channeldisplay"
import { chatBox } from "./chat"
import { messageBox } from "./messagebox"
import { userListBox, refreshUserList as refreshUserListImpl } from "./userlist"

const chatView = new BoxRenderable(renderer, {
  id: "chat-view",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  flexDirection: "column",
})

chatView.add(chatBox)
chatView.add(messageBox)

const body = new BoxRenderable(renderer, {
  id: "channel-body",
  flexGrow: 1,
  flexShrink: 1,
  minHeight: 0,
  flexDirection: "row",
})

body.add(chatView)

export const channelBox = new BoxRenderable(renderer, {
  id: "channel-box",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  flexDirection: "column",
})

channelBox.add(channelHeader)
channelBox.add(body)

export let userListVisible = false

export function showUserList() {
  if (userListVisible) return
  userListVisible = true
  refreshUserListImpl()
  body.add(userListBox)
}

export function hideUserList() {
  if (!userListVisible) return
  userListVisible = false
  body.remove(userListBox.id)
}

export function toggleUserList() {
  userListVisible ? hideUserList() : showUserList()
}

export function refreshUserList() {
  if (userListVisible) refreshUserListImpl()
}

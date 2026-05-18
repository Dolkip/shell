import { BoxRenderable, TextRenderable, SelectRenderable, ScrollBoxRenderable, SelectRenderableEvents } from "@opentui/core";
import { renderer } from "../renderer";
import { client } from "../discord"
import { fetchChannel, fetchGuild, getGuildChannels, getGuilds } from "../discord";
import { Theme } from "../theme";

//owie this hurts my head :(
export async function createGuildBox(guildId: string) {
    const guild = await fetchGuild(guildId)
    const channels = await getGuildChannels(guild);
    const guildName = new TextRenderable(renderer, {
        content: guild.name,
        fg: Theme.accent
    })
    const channelArray: { name: string; description: string; value: string }[] = []
    const validChannels = channels;
    let index = 0
    for (const channel of validChannels) {
        const prefix = index === validChannels.length - 1 ? "╰" : "├";
        channelArray.push({
            name: prefix + "─ #" + (channel.name ?? channel.id),
            description: channel.id,
            value: channel.id
        })
        index++
    }
    const channelSelect = new SelectRenderable(renderer, {
        options: channelArray,
        textColor: Theme.selectionText,
        backgroundColor: Theme.selectionBackground,
        selectedBackgroundColor: Theme.accent,
        selectedTextColor: Theme.text,
        descriptionColor: Theme.selectionDescription,
    })
    
    channelSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: any) => {
        console.log("chosen channel ", option.value ?? option.description);
        // code happens here, loadChannel() perhaps
    })
    
    const guildBox = new BoxRenderable(renderer, {

    })

    //we add the things now
    guildBox.add(guildName)
    guildBox.add(channelSelect)
    
    return guildBox
}

export const guildsMenu = new ScrollBoxRenderable(renderer, {

})
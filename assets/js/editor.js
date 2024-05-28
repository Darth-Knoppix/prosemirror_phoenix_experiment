import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import * as Y from "yjs";
import { ySyncPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";
import { channel } from "./editor_socket";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

/**
 *
 * @param {HTMLElement} place
 * @param {string} clientID
 * @param {import('yjs').Doc} ydoc
 * @returns {EditorView}
 */
export function startEditor(place, clientID, ydoc) {
  ydoc.on("update", (update) => {
    channel.push("transaction", { data: [btoa(update)] });
  });

  channel.on("transaction", ({ data }) => {
    data
      .map((d) => new Uint8Array(atob(d).split(",").map(Number)))
      .forEach((update) => {
        Y.applyUpdate(ydoc, update);
      });
  });

  // channel.on("new-doc", console.log);

  // channel.on("request-last-doc", () => {
  //   channel.push("new-doc", { clientID, data: Y.encodeStateAsUpdate(ydoc) });
  // });

  const yXmlFragment = ydoc.getXmlFragment("prosemirror");

  const view = new EditorView(place, {
    state: EditorState.create({
      schema: mySchema,
      plugins: [
        ySyncPlugin(yXmlFragment),
        yUndoPlugin(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
        }),
        ...exampleSetup({ schema: mySchema }),
      ],
    }),
  });

  return view;
}

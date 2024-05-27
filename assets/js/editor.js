import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import {
  collab,
  receiveTransaction,
  sendableSteps,
  getVersion,
} from "prosemirror-collab";

import { channel } from "./editor_socket.js";
import { Step } from "prosemirror-transform";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

/**
 *
 * @param {HTMLElement} place
 * @returns {EditorView}
 */
export function startEditor(place, clientID) {
  const view = new EditorView(place, {
    state: EditorState.create({
      schema: mySchema,
      plugins: [...exampleSetup({ schema: mySchema }), collab({ clientID })],
    }),
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction);
      view.updateState(newState);
      let sendable = sendableSteps(newState);
      if (sendable) {
        channel.push("transaction", {
          version: sendable.version,
          steps: sendable.steps,
          clientID: sendable.clientID,
        });
      }
    },
  });

  // authority.onNewSteps.push(function () {
  //   let newData = authority.stepsSince(getVersion(view.state));
  //   view.dispatch(
  //     receiveTransaction(view.state, newData.steps, newData.clientIDs)
  //   );
  // });

  channel.on("transaction", (payload) => {
    console.log({ payload, version: getVersion(view.state) });
    view.dispatch(
      receiveTransaction(
        view.state,
        payload.steps.map((s) => Step.fromJSON(mySchema, s)),
        [payload.clientID]
      )
    );
  });

  return view;
}

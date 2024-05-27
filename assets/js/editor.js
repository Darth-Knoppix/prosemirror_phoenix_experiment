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

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
export const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

/**
 *
 * @param {Authority} authority
 * @param {HTMLElement} place
 * @returns {EditorView}
 */
export function startEditor(authority, place) {
  const view = new EditorView(place, {
    state: EditorState.create({
      doc: authority.doc,
      plugins: [
        ...exampleSetup({ schema: mySchema }),
        collab({ version: authority.steps.length }),
      ],
    }),
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction);
      view.updateState(newState);
      let sendable = sendableSteps(newState);
      if (sendable)
        authority.receiveSteps(
          sendable.version,
          sendable.steps,
          sendable.clientID
        );
    },
  });

  authority.onNewSteps.push(function () {
    let newData = authority.stepsSince(getVersion(view.state));
    view.dispatch(
      receiveTransaction(view.state, newData.steps, newData.clientIDs)
    );
  });

  return;
}

export class Authority {
  constructor(doc) {
    this.doc = doc;
    this.steps = [];
    this.stepClientIDs = [];
    this.onNewSteps = [];
  }

  receiveSteps(version, steps, clientID) {
    if (version != this.steps.length) return;

    // Apply and accumulate new steps
    steps.forEach((step) => {
      this.doc = step.apply(this.doc).doc;
      this.steps.push(step);
      this.stepClientIDs.push(clientID);
    });
    // Signal listeners
    this.onNewSteps.forEach(function (f) {
      f();
    });
  }

  stepsSince(version) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version),
    };
  }
}

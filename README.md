# ProsemirrorPhoenixExperiment

## What is this?

An experiment with [ProseMirror](https://prosemirror.net/) to get it working with over Phoenix channels using websockets.

### What worked?

- Can communicate over Pheonix channels and update the client's local state, keeping editors in sync
- Receives a client ID from the server

### TODO

- [ ] Store the document on the socket so if a client joins, it will have the document to start from

## How to

To start your Phoenix server:

- Run `mix setup` to install and setup dependencies
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix

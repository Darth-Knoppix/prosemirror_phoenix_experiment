defmodule ProsemirrorPhoenixExperimentWeb.WorkspaceChannel do
  use ProsemirrorPhoenixExperimentWeb, :channel

  @impl true
  def join("workspace:public", _payload, socket) do
    # Generate a random clientID
    clientId = for _ <- 1..10, into: "", do: <<Enum.random(~c"0123456789abcdef")>>

    socket = assign(socket, :clientId, clientId)

    {:ok, %{clientId: clientId, doc: DocRecorder.value()}, socket}
  end

  @impl true
  def handle_in("transaction", payload, socket) do
    broadcast(socket, "transaction", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("new-doc", payload, socket) do
    # This doc could be stored and retrieved to keep in sync
    DocRecorder.set(payload)
    broadcast(socket, "new-doc", payload)
    {:noreply, socket}
  end
end

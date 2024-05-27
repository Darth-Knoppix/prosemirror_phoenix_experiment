defmodule ProsemirrorPhoenixExperimentWeb.WorkspaceChannel do
  use ProsemirrorPhoenixExperimentWeb, :channel

  @impl true
  def join("workspace:public", _payload, socket) do
    # Generate a random clientID
    clientId = for _ <- 1..10, into: "", do: <<Enum.random(~c"0123456789abcdef")>>

    socket = assign(socket, :clientId, clientId)

    {:ok, %{clientId: clientId, steps: StepRecorder.value()}, socket}
  end

  @impl true
  def handle_in("transaction", payload, socket) do
    StepRecorder.append(payload["steps"])

    broadcast(socket, "transaction", payload)
    {:noreply, socket}
  end
end

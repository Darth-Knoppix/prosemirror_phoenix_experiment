defmodule DocRecorder do
  use Agent

  def start_link(initial_value) do
    Agent.start_link(fn -> initial_value end, name: __MODULE__)
  end

  def value do
    Agent.get(__MODULE__, & &1)
  end

  def set(newDoc) do
    Agent.update(__MODULE__, fn _s -> newDoc end)
  end
end

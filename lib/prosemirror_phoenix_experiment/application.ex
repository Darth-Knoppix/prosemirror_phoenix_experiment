defmodule ProsemirrorPhoenixExperiment.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ProsemirrorPhoenixExperimentWeb.Telemetry,
      {DNSCluster,
       query: Application.get_env(:prosemirror_phoenix_experiment, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: ProsemirrorPhoenixExperiment.PubSub},
      StepRecorder,
      # Start a worker by calling: ProsemirrorPhoenixExperiment.Worker.start_link(arg)
      # {ProsemirrorPhoenixExperiment.Worker, arg},
      # Start to serve requests, typically the last entry
      ProsemirrorPhoenixExperimentWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ProsemirrorPhoenixExperiment.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ProsemirrorPhoenixExperimentWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

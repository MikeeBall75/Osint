"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plug,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Globe,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string | null;
  type: string;
  baseUrl: string;
  headers: string;
  endpointTemplate: string;
  responseMapping: string;
  enabled: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  description: string;
  type: string;
  baseUrl: string;
  headers: string;
  endpointTemplate: string;
  responseMapping: string;
  enabled: boolean;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  type: "email",
  baseUrl: "",
  headers: "{}",
  endpointTemplate: "",
  responseMapping: "{}",
  enabled: true,
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/integrations");
      const data = await res.json();
      if (Array.isArray(data)) setIntegrations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(integration: Integration) {
    setEditingId(integration.id);
    setForm({
      name: integration.name,
      description: integration.description || "",
      type: integration.type,
      baseUrl: integration.baseUrl,
      headers: integration.headers,
      endpointTemplate: integration.endpointTemplate,
      responseMapping: integration.responseMapping,
      enabled: integration.enabled,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let parsedHeaders, parsedMapping;
      try {
        parsedHeaders = JSON.parse(form.headers);
      } catch {
        setError("Headers must be valid JSON");
        setSaving(false);
        return;
      }
      try {
        parsedMapping = JSON.parse(form.responseMapping);
      } catch {
        setError("Response mapping must be valid JSON");
        setSaving(false);
        return;
      }

      const body = {
        name: form.name,
        description: form.description || null,
        type: form.type,
        baseUrl: form.baseUrl,
        headers: parsedHeaders,
        endpointTemplate: form.endpointTemplate,
        responseMapping: parsedMapping,
        enabled: form.enabled,
      };

      const url = editingId
        ? `/api/admin/integrations/${editingId}`
        : "/api/admin/integrations";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      setShowForm(false);
      fetchIntegrations();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this integration?")) return;
    await fetch(`/api/admin/integrations/${id}`, { method: "DELETE" });
    fetchIntegrations();
  }

  async function handleToggle(integration: Integration) {
    await fetch(`/api/admin/integrations/${integration.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !integration.enabled }),
    });
    fetchIntegrations();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Plug className="w-6 h-6 text-purple-400" />
          API Integrations
        </h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Help */}
      <div className="flex items-start gap-3 bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
        <Info className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-400">
          <p className="mb-2">
            Add OSINT API sources here. Each integration defines how to call an
            external API when a user searches.
          </p>
          <p>
            Use <code className="text-brand-300">{"{{query}}"}</code> in the
            endpoint template as a placeholder for the search term. The response
            mapping uses dot notation (e.g.{" "}
            <code className="text-brand-300">$.data.name</code>) to extract
            fields.
          </p>
        </div>
      </div>

      {/* List */}
      {integrations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Plug className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No integrations configured</p>
          <p className="text-gray-500 text-sm mt-1">
            Add your first OSINT API source to enable searches.
          </p>
          <button onClick={openCreate} className="btn-primary mt-4">
            Add Your First API
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {integration.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          integration.enabled
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {integration.enabled ? "Active" : "Disabled"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-gray-400">
                        {integration.type}
                      </span>
                    </div>
                    {integration.description && (
                      <p className="text-gray-500 text-sm mt-0.5">
                        {integration.description}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mt-1 font-mono">
                      {integration.baseUrl}
                      {integration.endpointTemplate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(integration)}
                    className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                    title={
                      integration.enabled ? "Disable" : "Enable"
                    }
                  >
                    {integration.enabled ? (
                      <ToggleRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(integration)}
                    className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Integration" : "Add Integration"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-surface-elevated rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g. Have I Been Pwned"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Search Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="email">Email only</option>
                    <option value="phone">Phone only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text">Description</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input-field"
                  placeholder="Brief description of this API source"
                />
              </div>

              <div>
                <label className="label-text">Base URL *</label>
                <input
                  value={form.baseUrl}
                  onChange={(e) =>
                    setForm({ ...form, baseUrl: e.target.value })
                  }
                  className="input-field"
                  placeholder="https://api.example.com"
                  required
                />
              </div>

              <div>
                <label className="label-text">
                  Endpoint Template *
                </label>
                <input
                  value={form.endpointTemplate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endpointTemplate: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="/v3/search/{{query}}"
                  required
                />
                <p className="text-gray-600 text-xs mt-1">
                  Use {"{{query}}"} as a placeholder for the search term
                </p>
              </div>

              <div>
                <label className="label-text">
                  Headers (JSON)
                </label>
                <textarea
                  value={form.headers}
                  onChange={(e) =>
                    setForm({ ...form, headers: e.target.value })
                  }
                  className="input-field font-mono text-sm"
                  rows={3}
                  placeholder='{"Authorization": "Bearer YOUR_API_KEY"}'
                />
              </div>

              <div>
                <label className="label-text">
                  Response Mapping (JSON)
                </label>
                <textarea
                  value={form.responseMapping}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      responseMapping: e.target.value,
                    })
                  }
                  className="input-field font-mono text-sm"
                  rows={3}
                  placeholder='{"name": "$.data.name", "email": "$.data.email"}'
                />
                <p className="text-gray-600 text-xs mt-1">
                  Map response fields using dot notation. Leave as {"{}"} to
                  return raw response.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, enabled: !form.enabled })
                  }
                  className="flex items-center gap-2"
                >
                  {form.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                  )}
                  <span className="text-gray-300 text-sm">
                    {form.enabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Create Integration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import { useEffect, useState } from 'react'
import useSystemStore from '../../store/use-system-store.tsx';

function DescriptionTable({ data }) {
  const models = [...new Set(Object.values(data).map((item) => item.model))];
  const prompts = [...new Set(Object.values(data).map((item) => item.prompt))];
  
  // Use global filter states
  const { selectedModels, setSelectedModels } = useSystemStore();
  const [selectedPrompts, setSelectedPrompts] = useState([...prompts]);

  const filteredData = Object.entries(data).filter(([id, item]) => {
    const modelMatch =
      selectedModels.length === 0 || selectedModels.includes(item.model);
    const promptMatch =
      selectedPrompts.length === 0 || selectedPrompts.includes(item.prompt);
    return modelMatch && promptMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <label>
          Filter by Model:
          <div>
            {models.map((model) => (
              <label key={model} style={{ marginTop: "8px", marginRight: "8px" }}>
                <input
                  type="checkbox"
                  value={model}
                  checked={selectedModels.includes(model)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels([...selectedModels, model]);
                    } else {
                      setSelectedModels(selectedModels.filter((m) => m !== model));
                    }
                  }}
                />
                {model}
              </label>
            ))}
          </div>
        </label>

        <label>
          Filter by Prompt:
          <div>
            {prompts.map((prompt) => (
              <label key={prompt} style={{ marginRight: "8px" }}>
                <input
                  type="checkbox"
                  value={prompt}
                  checked={selectedPrompts.includes(prompt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPrompts([...selectedPrompts, prompt]);
                    } else {
                      setSelectedPrompts(selectedPrompts.filter((p) => p !== prompt));
                    }
                  }}
                />
                {prompt}
              </label>
            ))}
          </div>
        </label>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>
              Description
            </th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Model</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Prompt</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(([id, item]) => (
            <tr key={id}>
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>{id}</td>
              <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }}>
                <ReactMarkdown>{item.description}</ReactMarkdown>
              </td>
              <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }}>
                {item.model}
              </td>
              <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }}>
                {item.prompt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DescriptionTable;
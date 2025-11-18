import React, { useState } from 'react';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'selection';
  label: string;
  required: boolean;
  options?: string[];
}

interface ReportSection {
  id: string;
  title: string;
  fields: ReportField[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
}

interface ReportData {
  [sectionId: string]: {
    [fieldId: string]: any;
  };
}

const ReportBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: 't1',
      name: 'Weekly Productivity Report',
      description: 'Track team productivity and task completion',
      sections: [
        {
          id: 's1',
          title: 'Summary',
          fields: [
            { id: 'f1', name: 'reportingPeriod', type: 'text', label: 'Reporting Period', required: true },
            { id: 'f2', name: 'totalTasks', type: 'number', label: 'Total Tasks', required: true },
            { id: 'f3', name: 'completedTasks', type: 'number', label: 'Completed Tasks', required: true }
          ]
        },
        {
          id: 's2',
          title: 'Detailed Analysis',
          fields: [
            { id: 'f4', name: 'productivityScore', type: 'number', label: 'Productivity Score', required: false },
            { id: 'f5', name: 'challenges', type: 'text', label: 'Challenges Faced', required: false }
          ]
        }
      ]
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(templates[0]);
  const [reportData, setReportData] = useState<ReportData>({});
  const [newField, setNewField] = useState<Omit<ReportField, 'id'>>({ 
    name: '', 
    type: 'text', 
    label: '', 
    required: false 
  });
  const [newSection, setNewSection] = useState<Omit<ReportSection, 'id' | 'fields'>>({ 
    title: '' 
  });

  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value
      }
    }));
  };

  const addFieldToSection = (sectionId: string) => {
    if (!newField.name || !newField.label || !selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    const section = updatedTemplate.sections.find(s => s.id === sectionId);
    
    if (section) {
      section.fields.push({
        ...newField,
        id: `field-${Date.now()}`
      });
      
      setSelectedTemplate(updatedTemplate);
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
      );
      
      setNewField({ 
        name: '', 
        type: 'text', 
        label: '', 
        required: false 
      });
    }
  };

  const addSectionToTemplate = () => {
    if (!newSection.title || !selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    updatedTemplate.sections.push({
      ...newSection,
      id: `section-${Date.now()}`,
      fields: []
    });
    
    setSelectedTemplate(updatedTemplate);
    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
    );
    
    setNewSection({ title: '' });
  };

  const removeField = (sectionId: string, fieldId: string) => {
    if (!selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    const section = updatedTemplate.sections.find(s => s.id === sectionId);
    
    if (section) {
      section.fields = section.fields.filter(f => f.id !== fieldId);
      setSelectedTemplate(updatedTemplate);
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
      );
    }
  };

  const removeSection = (sectionId: string) => {
    if (!selectedTemplate) return;

    const updatedTemplate = { ...selectedTemplate };
    updatedTemplate.sections = updatedTemplate.sections.filter(s => s.id !== sectionId);
    
    setSelectedTemplate(updatedTemplate);
    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
    );
  };

  const createNewTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Report Template',
      description: 'Description for new template',
      sections: []
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
  };

  const renderFieldInput = (sectionId: string, field: ReportField) => {
    const value = reportData[sectionId]?.[field.id] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
            placeholder={field.label}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(sectionId, field.id, Number(e.target.value))}
            placeholder={field.label}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
          />
        );
      
      case 'boolean':
        return (
          <label>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(sectionId, field.id, e.target.checked)}
            />
            {field.label}
          </label>
        );
      
      case 'selection':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
            placeholder={field.label}
          />
        );
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Report exported in ${format.toUpperCase()} format!`);
    // In a real application, this would generate and download the actual file
  };

  return (
    <div className="report-builder">
      <div className="builder-header">
        <h2>Report Builder</h2>
        <div className="header-actions">
          <button onClick={createNewTemplate}>New Template</button>
        </div>
      </div>
      
      <div className="builder-content">
        <div className="templates-panel">
          <h3>Templates</h3>
          {templates.map(template => (
            <div 
              key={template.id}
              className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
          ))}
        </div>
        
        {selectedTemplate && (
          <div className="template-editor">
            <div className="template-header">
              <h3>{selectedTemplate.name}</h3>
              <p>{selectedTemplate.description}</p>
            </div>
            
            <div className="sections-editor">
              <div className="section-form">
                <input
                  type="text"
                  placeholder="Section title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                />
                <button onClick={addSectionToTemplate}>Add Section</button>
              </div>
              
              {selectedTemplate.sections.map(section => (
                <div key={section.id} className="section">
                  <div className="section-header">
                    <h4>{section.title}</h4>
                    <button 
                      className="remove-section"
                      onClick={() => removeSection(section.id)}
                    >
                      Remove Section
                    </button>
                  </div>
                  
                  <div className="fields-editor">
                    <div className="field-form">
                      <input
                        type="text"
                        placeholder="Field name"
                        value={newField.name}
                        onChange={(e) => setNewField({...newField, name: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Field label"
                        value={newField.label}
                        onChange={(e) => setNewField({...newField, label: e.target.value})}
                      />
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({...newField, type: e.target.value as any})}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="selection">Selection</option>
                      </select>
                      <label>
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({...newField, required: e.target.checked})}
                        />
                        Required
                      </label>
                      <button onClick={() => addFieldToSection(section.id)}>Add Field</button>
                    </div>
                    
                    <div className="fields-list">
                      {section.fields.map(field => (
                        <div key={field.id} className="field-item">
                          <div className="field-input">
                            {renderFieldInput(section.id, field)}
                          </div>
                          <div className="field-info">
                            <span className="field-label">{field.label}</span>
                            <span className="field-type">{field.type}</span>
                            {field.required && <span className="required-badge">Required</span>}
                          </div>
                          <button 
                            className="remove-field"
                            onClick={() => removeField(section.id, field.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="report-actions">
              <button onClick={() => exportReport('pdf')}>Export as PDF</button>
              <button onClick={() => exportReport('excel')}>Export as Excel</button>
              <button onClick={() => exportReport('csv')}>Export as CSV</button>
            </div>
          </div>
        )}
      </div>
      

    </div>
  );
};

export default ReportBuilder;
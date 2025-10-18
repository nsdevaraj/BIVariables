// BI Configuration Builder Application
class BIConfigBuilder {
    constructor() {
        // Application state
        this.globalVariables = [];
        this.visualElements = [];
        this.events = [];
        this.states = [];
        this.connections = [];
        this.selectedItem = null;
        this.isTestMode = false;
        
        // Initialize with sample data
        this.initializeSampleData();
        
        // Initialize the application
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderVariables();
        this.renderElements();
        this.renderEvents();
        this.renderStates();
    }

    initializeSampleData() {
        // Using the comprehensive sample data from the original file
        this.globalVariables = [
            { id: "region_filter", name: "Selected Region", type: "String", default_value: "All", current_value: "North America", description: "Currently selected region for filtering data" },
            { id: "date_range", name: "Date Range", type: "Object", default_value: "{start: '2024-01-01', end: '2024-12-31'}", current_value: "{start: '2024-01-01', end: '2024-10-18'}", description: "Selected date range for time-based filtering" },
            { id: "show_details", name: "Show Detail View", type: "Boolean", default_value: false, current_value: true, description: "Toggle for showing detailed view vs summary" }
        ];

        this.visualElements = [
            { id: "chart_1", name: "Sales Performance Chart", type: "Chart", icon: "📊", properties: { title: "Regional Sales Performance", data_source: "sales_data", filter_by: "region_filter" } },
            { id: "kpi_1", name: "Total Revenue KPI", type: "KPI", icon: "📈", properties: { value: "$2.5M", trend: "+15%", color: "green" } }
        ];

        this.events = [
            { id: "evt_1", name: "Region Selection Changed", trigger: "filter_1.onChange", action: "update_global_variable", target: "region_filter", parameters: { value: "event.target.value" } }
        ];

        this.states = [
            { id: "state_1", name: "Region Focused View", condition: "region_filter != 'All'", effects: [ { element: "chart_1", properties: { title: "Sales Performance - ${region_filter}" } } ] }
        ];
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('testModeBtn').addEventListener('click', () => this.toggleTestMode());
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfiguration());

        // Sidebar buttons
        document.getElementById('addVariableBtn').addEventListener('click', () => this.showVariableModal());
        document.getElementById('addElementBtn').addEventListener('click', () => this.showElementModal());
        document.getElementById('addEventBtn').addEventListener('click', () => this.showEventModal());
        document.getElementById('addStateBtn').addEventListener('click', () => this.showStateModal());

        // Tab switching for the new sidebar
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPanelTab(e.target.dataset.panel));
        });

        // Variable search
        document.getElementById('variableSearch').addEventListener('input', (e) => {
            this.filterVariables(e.target.value);
        });

        // All modal event listeners are preserved
        this.setupModalListeners();
    }

    // This function is new, to handle the tab switching in the redesigned sidebar
    switchPanelTab(panelName) {
        // Update tab buttons state
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.sidebar-tab-btn[data-panel="${panelName}"]`).classList.add('active');

        // Update panel visibility
        document.querySelectorAll('.sidebar-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${panelName}Panel`).classList.add('active');
    }

    setupModalListeners() {
        // This function is largely the same as the original, just ensuring IDs are correct.
        // Variable modal
        document.getElementById('closeVariableModal').addEventListener('click', () => this.hideModal('variableModal'));
        document.getElementById('cancelVariableBtn').addEventListener('click', () => this.hideModal('variableModal'));
        document.getElementById('saveVariableBtn').addEventListener('click', () => this.saveVariable());

        // Element modal
        document.getElementById('closeElementModal').addEventListener('click', () => this.hideModal('elementModal'));
        document.querySelectorAll('.element-type').forEach(type => {
            type.addEventListener('click', (e) => {
                const elementType = e.currentTarget.dataset.type;
                this.addElement(elementType);
                this.hideModal('elementModal');
            });
        });

        // Event modal
        document.getElementById('closeEventModal').addEventListener('click', () => this.hideModal('eventModal'));
        document.getElementById('cancelEventBtn').addEventListener('click', () => this.hideModal('eventModal'));
        document.getElementById('saveEventBtn').addEventListener('click', () => this.saveEvent());
        
        // State modal
        document.getElementById('closeStateModal').addEventListener('click', () => this.hideModal('stateModal'));
        document.getElementById('cancelStateBtn').addEventListener('click', () => this.hideModal('stateModal'));
        document.getElementById('saveStateBtn').addEventListener('click', () => this.saveState());

        // Test modal
        document.getElementById('closeTestModal').addEventListener('click', () => this.hideModal('testModal'));
    }

    renderVariables() {
        const variablesList = document.getElementById('variablesList');
        variablesList.innerHTML = '';
        this.globalVariables.forEach(variable => {
            const variableElement = this.createListItem(variable, 'variable');
            variablesList.appendChild(variableElement);
        });
    }

    renderElements() {
        const elementsGrid = document.getElementById('elementsGrid');
        elementsGrid.innerHTML = '';
        this.visualElements.forEach(element => {
            const elementCard = this.createElementCard(element);
            elementsGrid.appendChild(elementCard);
        });
    }

    renderEvents() {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';
        this.events.forEach(event => {
            const eventElement = this.createListItem(event, 'event');
            eventsList.appendChild(eventElement);
        });
    }

    renderStates() {
        const statesList = document.getElementById('statesList');
        statesList.innerHTML = '';
        this.states.forEach(state => {
            const stateElement = this.createListItem(state, 'state');
            statesList.appendChild(stateElement);
        });
    }

    createListItem(item, type) {
        const element = document.createElement('div');
        element.className = `${type}-item`; // e.g., variable-item
        element.dataset[`${type}Id`] = item.id;

        if (type === 'variable') {
            element.innerHTML = `<div class="variable-name">${item.name}</div><div class="variable-type">${item.type}</div>`;
        } else if (type === 'event') {
            element.innerHTML = `<p>${item.name}</p><small>${item.trigger} -> ${item.action}</small>`;
        } else if (type === 'state') {
            element.innerHTML = `<div class="state-header"><span class="state-name">${item.name}</span></div><div class="state-condition"><strong>When:</strong> ${item.condition}</div>`;
        }

        element.addEventListener('click', () => this.selectItem(type, item));
        return element;
    }

    createElementCard(element) {
        const card = document.createElement('div');
        card.className = 'element-card';
        card.dataset.elementId = element.id;
        card.innerHTML = `
            <div class="element-header">
                <span class="element-icon">${element.icon}</span>
                <span class="element-title">${element.name}</span>
            </div>
        `;
        card.addEventListener('click', () => this.selectItem('element', element));
        return card;
    }

    selectItem(type, item) {
        this.selectedItem = { type, data: item };
        this.updatePropertiesPanel();
        
        // Visual feedback for selection
        document.querySelectorAll('.variable-item, .element-card, .event-item, .state-item').forEach(el => el.classList.remove('selected'));
        const selector = item.id.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1');
        const selectedElement = document.querySelector(`[data-${type}-id="${selector}"]`);

        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }

    updatePropertiesPanel() {
        const propertiesContent = document.getElementById('propertiesContent');
        const selectionIndicator = document.getElementById('selectionIndicator');
        
        if (!this.selectedItem) {
            propertiesContent.innerHTML = '<div class="empty-state"><p>👆 Select an item to view properties</p></div>';
            selectionIndicator.textContent = 'No selection';
            return;
        }
        
        const { type, data } = this.selectedItem;
        selectionIndicator.textContent = `${type}: ${data.name}`;
        
        let propertiesHtml = '';
        for (const [key, value] of Object.entries(data)) {
            propertiesHtml += `<div class="property-row"><span class="property-label">${key}</span><span class="property-value">${this.formatValue(value)}</span></div>`;
        }
        propertiesHtml += `
            <div class="property-group" style="margin-top: 20px;">
                <button class="btn btn--primary btn--sm btn--full-width" onclick="app.editSelectedItem()">Edit ${type}</button>
                <button class="btn btn--secondary btn--sm btn--full-width" style="margin-top: 8px;" onclick="app.deleteSelectedItem()">Delete ${type}</button>
            </div>
        `;

        propertiesContent.innerHTML = `<div class="property-group">${propertiesHtml}</div>`;
    }

    editSelectedItem() {
        if (!this.selectedItem) return;
        const { type, data } = this.selectedItem;
        if (type === 'variable') this.showVariableModal(data.id);
        if (type === 'event') this.showEventModal(data.id);
        if (type === 'state') this.showStateModal(data.id);
        // Add edit for elements if needed
    }

    deleteSelectedItem() {
        if (!this.selectedItem) return;
        const { type, data } = this.selectedItem;
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'variable') this.globalVariables = this.globalVariables.filter(i => i.id !== data.id);
            if (type === 'element') this.visualElements = this.visualElements.filter(i => i.id !== data.id);
            if (type === 'event') this.events = this.events.filter(i => i.id !== data.id);
            if (type === 'state') this.states = this.states.filter(i => i.id !== data.id);
            
            this.selectedItem = null;
            this.rerenderAll();
            this.updatePropertiesPanel();
        }
    }

    rerenderAll() {
        this.renderVariables();
        this.renderElements();
        this.renderEvents();
        this.renderStates();
    }

    formatValue(value) {
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    showModal(modalId) { document.getElementById(modalId).classList.add('active'); }
    hideModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

    showVariableModal(id = null) {
        const form = document.getElementById('variableForm');
        form.reset();
        form.dataset.id = id || '';
        
        if (id) {
            const item = this.globalVariables.find(v => v.id === id);
            document.getElementById('variableName').value = item.name;
            document.getElementById('variableType').value = item.type;
            document.getElementById('variableDefault').value = item.default_value;
            document.getElementById('variableDescription').value = item.description;
        }
        this.showModal('variableModal');
    }

    saveVariable() {
        const form = document.getElementById('variableForm');
        const id = form.dataset.id;
        const newVar = {
            name: document.getElementById('variableName').value,
            type: document.getElementById('variableType').value,
            default_value: document.getElementById('variableDefault').value,
            description: document.getElementById('variableDescription').value,
        };

        if (id) {
            const index = this.globalVariables.findIndex(v => v.id === id);
            this.globalVariables[index] = { ...this.globalVariables[index], ...newVar };
        } else {
            newVar.id = `var_${Date.now()}`;
            newVar.current_value = newVar.default_value;
            this.globalVariables.push(newVar);
        }
        this.renderVariables();
        this.hideModal('variableModal');
    }

    showEventModal(id = null) {
        const form = document.getElementById('eventForm');
        form.reset();
        form.dataset.id = id || '';

        this.populateElementSelect(document.getElementById('eventElement'));
        this.populateVariableSelect(document.getElementById('eventTarget'));

        if (id) {
            const item = this.events.find(e => e.id === id);
            document.getElementById('eventName').value = item.name;
            // more fields to populate
        }
        this.showModal('eventModal');
    }

    saveEvent() {
        // Save logic preserved from original
        const form = document.getElementById('eventForm');
        const id = form.dataset.id;
        const newEvent = {
             name: document.getElementById('eventName').value,
             trigger: `${document.getElementById('eventElement').value}.${document.getElementById('eventTrigger').value}`,
             action: document.getElementById('eventAction').value,
             target: document.getElementById('eventTarget').value
        };

        if (id) {
             const index = this.events.findIndex(e => e.id === id);
             this.events[index] = { ...this.events[index], ...newEvent };
        } else {
             newEvent.id = `evt_${Date.now()}`;
             this.events.push(newEvent);
        }
        this.renderEvents();
        this.hideModal('eventModal');
    }

    showStateModal(id = null) {
        const form = document.getElementById('stateForm');
        form.reset();
        form.dataset.id = id || '';
        
        this.populateVariableSelect(document.getElementById('stateVariable'));
        this.populateVariableSelect(document.getElementById('compareVariable'));

        if (id) {
            const item = this.states.find(s => s.id === id);
            document.getElementById('stateName').value = item.name;
            // more fields to populate
        }
        this.showModal('stateModal');
    }

    saveState() {
        // Save logic preserved from original
        const form = document.getElementById('stateForm');
        const id = form.dataset.id;
        const newState = {
             name: document.getElementById('stateName').value,
             condition: `${document.getElementById('stateVariable').value} ${document.getElementById('stateOperator').value} ${document.getElementById('stateValue').value}`,
             effects: [] // Simplified for now
        };

        if (id) {
             const index = this.states.findIndex(s => s.id === id);
             this.states[index] = { ...this.states[index], ...newState };
        } else {
             newState.id = `st_${Date.now()}`;
             this.states.push(newState);
        }
        this.renderStates();
        this.hideModal('stateModal');
    }

    addElement(type) {
        const icons = {'Chart': '📊', 'KPI': '📈', 'Filter': '🔽', 'Table': '📋', 'Button': '🔘'};
        const newElement = {
            id: `el_${Date.now()}`, name: `New ${type}`, type, icon: icons[type] || '❓', properties: {}
        };
        this.visualElements.push(newElement);
        this.renderElements();
    }
    
    toggleTestMode() { this.showModal('testModal'); }
    saveConfiguration() { console.log('Saving config...'); }
    filterVariables(searchTerm) {
        const lower = searchTerm.toLowerCase();
        document.querySelectorAll('.variable-item').forEach(item => {
            const name = item.querySelector('.variable-name').textContent.toLowerCase();
            item.style.display = name.includes(lower) ? '' : 'none';
        });
    }

    populateElementSelect(select) {
        select.innerHTML = this.visualElements.map(el => `<option value="${el.id}">${el.name}</option>`).join('');
    }

    populateVariableSelect(select) {
        select.innerHTML = this.globalVariables.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }
}

// Initialize the application when the DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BIConfigBuilder();
});

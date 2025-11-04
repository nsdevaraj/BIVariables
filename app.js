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
        this.variablePreviousValues = {}; // Track previous values for onChange detection
        this.changedVariables = new Set(); // Track which variables changed
        
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
        this.logDebug('Application initialized', 'info');
    }

    initializeSampleData() {
        // Initialize global variables
        this.globalVariables = [
            {
                id: "region_filter",
                name: "Selected Region",
                type: "String",
                default_value: "All",
                current_value: "North America",
                description: "Currently selected region for filtering data"
            },
            {
                id: "date_range",
                name: "Date Range",
                type: "Object",
                default_value: "{start: '2024-01-01', end: '2024-12-31'}",
                current_value: "{start: '2024-01-01', end: '2024-10-18'}",
                description: "Selected date range for time-based filtering"
            },
            {
                id: "show_details",
                name: "Show Detail View",
                type: "Boolean",
                default_value: false,
                current_value: true,
                description: "Toggle for showing detailed view vs summary"
            },
            {
                id: "selected_metric",
                name: "Primary Metric",
                type: "String",
                default_value: "Revenue",
                current_value: "Sales",
                description: "Currently selected primary metric to display"
            },
            {
                id: "dashboard_theme",
                name: "Dashboard Theme",
                type: "String",
                default_value: "Light",
                current_value: "Dark",
                description: "Current theme setting for the dashboard"
            },
            {
                id: "current_page",
                name: "Current Sheet",
                type: "String",
                default_value: "overview",
                current_value: "overview",
                description: "Currently active page in the navigation"
            },
            {
                id: "selected_tab",
                name: "Selected Visual",
                type: "String",
                default_value: "variables",
                current_value: "variables",
                description: "Currently selected tab in the interface"
            },
            {
                id: "navigation_history",
                name: "Navigation History",
                type: "Array",
                default_value: "[]",
                current_value: JSON.stringify(["overview", "dashboard"]),
                description: "History of pages visited for navigation tracking"
            },
            {
                id: "active_filters",
                name: "Active Filters",
                type: "Object",
                default_value: "{}",
                current_value: JSON.stringify({"region_filter": "North America", "date_range": "2024-10-18"}),
                description: "Currently applied filters and their values"
            },
            {
                id: "bookmark_configs",
                name: "Bookmark Configurations",
                type: "Array",
                default_value: "[]",
                current_value: JSON.stringify([{"id": "default_view", "name": "Default View", "filters": {"region_filter": "All"}}]),
                description: "Saved bookmark configurations for quick access"
            },
            {
                id: "current_bookmark",
                name: "Current Bookmark",
                type: "String",
                default_value: "",
                current_value: "",
                description: "Currently loaded bookmark configuration ID"
            }
        ];

        // Initialize visual elements
        this.visualElements = [
            {
                id: "chart_1",
                name: "Sales Performance Chart",
                type: "Chart",
                icon: "📊",
                properties: {
                    title: "Regional Sales Performance",
                    data_source: "sales_data",
                    filter_by: "region_filter",
                    visible: true
                },
                states: [
                    {
                        condition: "region_filter != 'All'",
                        properties: {
                            title: "Sales Performance - {region_filter}",
                            highlight_color: "#007acc"
                        }
                    }
                ]
            },
            {
                id: "kpi_1",
                name: "Total Revenue KPI",
                type: "KPI",
                icon: "📈",
                properties: {
                    value: "$2.5M",
                    trend: "+15%",
                    color: "green",
                    visible: true
                },
                states: [
                    {
                        condition: "selected_metric == 'Revenue'",
                        properties: {
                            visible: true,
                            color: "blue"
                        }
                    },
                    {
                        condition: "selected_metric != 'Revenue'",
                        properties: {
                            visible: false
                        }
                    }
                ]
            },
            {
                id: "filter_1",
                name: "Region Filter",
                type: "Filter",
                icon: "🔽",
                properties: {
                    options: ["All", "North America", "Europe", "Asia Pacific"],
                    selected_value: "region_filter",
                    visible: true
                },
                events: [
                    {
                        type: "Change",
                        action: "update_variable",
                        target: "region_filter",
                        value: "selected_option"
                    }
                ]
            },
            {
                id: "table_1",
                name: "Sales Data Table",
                type: "Table",
                icon: "📋",
                properties: {
                    data_source: "sales_data",
                    columns: ["Product", "Sales", "Region", "Date"],
                    page_size: 10,
                    visible: true
                },
                states: [
                    {
                        condition: "show_details == true",
                        properties: {
                            visible: true,
                            columns: ["Product", "Sales", "Region", "Date", "Profit", "Margin"]
                        }
                    },
                    {
                        condition: "show_details == false",
                        properties: {
                            visible: true,
                            columns: ["Product", "Sales", "Region"]
                        }
                    }
                ]
            }
        ];

        // Initialize events
        this.events = [
            {
                id: "evt_1",
                name: "Region Selection Changed",
                trigger: "filter_1.onChange",
                action: "update_global_variable",
                target: "region_filter",
                parameters: {
                    value: "event.target.value"
                }
            },
            {
                id: "evt_2",
                name: "Chart Click Event",
                trigger: "chart_1.onClick",
                action: "update_global_variable",
                target: "selected_metric",
                parameters: {
                    value: "clicked_data.metric"
                }
            },
            {
                id: "evt_3",
                name: "Toggle Detail View",
                trigger: "button_details.onClick",
                action: "toggle_variable",
                target: "show_details"
            },
            // Filter Events
            {
                id: "filter_apply_1",
                name: "Apply Region Filter",
                category: "Filter",
                trigger: "filter_region.onApply",
                action: "update_global_variable",
                target: "region_filter",
                parameters: {
                    value: "selected_filter_value"
                }
            },
            {
                id: "filter_clear_1",
                name: "Clear All Filters",
                category: "Filter",
                trigger: "filter_panel.onClear",
                action: "update_global_variable",
                target: "active_filters",
                parameters: {
                    value: "{}"
                }
            },
            {
                id: "filter_selection_1",
                name: "Filter Selection Changed",
                category: "Filter",
                trigger: "filter_date_range.onChange",
                action: "update_global_variable",
                target: "date_range",
                parameters: {
                    value: "selected_date_range"
                }
            },
            // Bookmark Events
            {
                id: "bookmark_save_1",
                name: "Save Current View",
                category: "Bookmark",
                trigger: "bookmark_button.onSave",
                action: "save_bookmark_config",
                target: "bookmark_configs",
                parameters: {
                    config_name: "user_defined_name",
                    include_filters: true,
                    include_states: true
                }
            },
            {
                id: "bookmark_load_1",
                name: "Load Dashboard View",
                category: "Bookmark",
                trigger: "bookmark_list.onSelect",
                action: "load_bookmark_config",
                target: "current_bookmark",
                parameters: {
                    bookmark_id: "selected_bookmark_id"
                }
            },
            {
                id: "bookmark_delete_1",
                name: "Delete Bookmark",
                category: "Bookmark",
                trigger: "bookmark_item.onDelete",
                action: "delete_bookmark_config",
                target: "bookmark_configs",
                parameters: {
                    bookmark_id: "target_bookmark_id"
                }
            },
            // Navigation Events
            {
                id: "nav_page_1",
                name: "Navigate to Dashboard",
                category: "Navigation",
                trigger: "nav_menu.dashboard.onClick",
                action: "update_global_variable",
                target: "current_page",
                parameters: {
                    value: "dashboard",
                    update_history: true
                }
            },
            {
                id: "nav_tab_1",
                name: "Switch to Elements Tab",
                category: "Navigation",
                trigger: "tab_elements.onClick",
                action: "update_global_variable",
                target: "selected_tab",
                parameters: {
                    value: "elements"
                }
            },
            {
                id: "nav_drill_1",
                name: "Drill Through to Details",
                category: "Navigation",
                trigger: "chart_1.onDrillThrough",
                action: "update_global_variable",
                target: "current_page",
                parameters: {
                    value: "details",
                    drill_context: "chart_data"
                }
            }
        ];

        // Initialize states
        this.states = [
            {
                id: "state_1",
                name: "Region Focused View",
                condition: "region_filter != 'All'",
                effects: [
                    {
                        element: "chart_1",
                        properties: {
                            title: "Sales Performance - ${region_filter}",
                            highlight_region: "region_filter"
                        }
                    },
                    {
                        element: "kpi_1",
                        properties: {
                            subtitle: "for ${region_filter}"
                        }
                    }
                ]
            },
            {
                id: "state_2",
                name: "Detail View Active",
                condition: "show_details == true",
                effects: [
                    {
                        element: "table_1",
                        properties: {
                            columns: ["Product", "Sales", "Region", "Date", "Profit", "Margin"],
                            page_size: 25
                        }
                    },
                    {
                        element: "chart_1",
                        properties: {
                            show_data_labels: true
                        }
                    }
                ]
            },
            // Filter States
            {
                id: "filter_state_1",
                name: "Filters Applied",
                category: "Filter",
                condition: "active_filters != '{}'",
                effects: [
                    {
                        element: "filter_indicator",
                        properties: {
                            visible: true,
                            text: "Filters Active",
                            count: "filter_count"
                        }
                    },
                    {
                        element: "chart_1",
                        properties: {
                            data_filtered: true,
                            filter_conditions: "active_filters"
                        }
                    }
                ]
            },
            {
                id: "filter_state_2",
                name: "No Active Filters",
                category: "Filter",
                condition: "active_filters == '{}'",
                effects: [
                    {
                        element: "filter_indicator",
                        properties: {
                            visible: false
                        }
                    },
                    {
                        element: "chart_1",
                        properties: {
                            data_filtered: false,
                            show_all_data: true
                        }
                    }
                ]
            },
            // Navigation States
            {
                id: "nav_state_1",
                name: "Dashboard Page Active",
                category: "Navigation",
                condition: "current_page == 'dashboard'",
                effects: [
                    {
                        element: "dashboard_container",
                        properties: {
                            visible: true,
                            active_page: "dashboard"
                        }
                    },
                    {
                        element: "nav_menu",
                        properties: {
                            highlight_item: "dashboard"
                        }
                    }
                ]
            },
            {
                id: "nav_state_2",
                name: "Elements Tab Selected",
                category: "Navigation",
                condition: "selected_tab == 'elements'",
                effects: [
                    {
                        element: "elements_panel",
                        properties: {
                            visible: true,
                            active: true
                        }
                    },
                    {
                        element: "variables_panel",
                        properties: {
                            visible: false,
                            active: false
                        }
                    }
                ]
            },
            {
                id: "nav_state_3",
                name: "Navigation History Available",
                category: "Navigation",
                condition: "navigation_history != '[]'",
                effects: [
                    {
                        element: "back_button",
                        properties: {
                            visible: true,
                            enabled: true
                        }
                    },
                    {
                        element: "breadcrumb",
                        properties: {
                            visible: true,
                            items: "navigation_history"
                        }
                    }
                ]
            },
            // Bookmark States
            {
                id: "bookmark_state_1",
                name: "Bookmark Loaded",
                category: "Bookmark",
                condition: "current_bookmark != ''",
                effects: [
                    {
                        element: "bookmark_indicator",
                        properties: {
                            visible: true,
                            text: "View: {current_bookmark}",
                            bookmark_active: true
                        }
                    },
                    {
                        element: "bookmark_list",
                        properties: {
                            highlight_item: "current_bookmark"
                        }
                    }
                ]
            },
            {
                id: "bookmark_state_2",
                name: "Bookmarks Available",
                category: "Bookmark",
                condition: "bookmark_configs != '[]'",
                effects: [
                    {
                        element: "bookmark_dropdown",
                        properties: {
                            visible: true,
                            items: "bookmark_configs"
                        }
                    },
                    {
                        element: "bookmark_save_button",
                        properties: {
                            visible: true
                        }
                    }
                ]
            },
            {
                id: "bookmark_state_3",
                name: "Default View Active",
                category: "Bookmark",
                condition: "current_bookmark == 'default_view'",
                effects: [
                    {
                        element: "dashboard_container",
                        properties: {
                            reset_filters: true,
                            reset_states: true
                        }
                    },
                    {
                        element: "notification",
                        properties: {
                            visible: true,
                            message: "Default view loaded"
                        }
                    }
                ]
            }
        ];
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('testModeBtn').addEventListener('click', () => this.toggleTestMode());
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfiguration());

        // Sidebar buttons
        document.getElementById('addVariableBtn').addEventListener('click', () => this.showVariableModal());
        document.getElementById('addElementBtn').addEventListener('click', () => this.showElementModal());
        document.getElementById('clearWorkspaceBtn').addEventListener('click', () => this.clearWorkspace());

        // Bottom panel buttons
        const addEventBtn = document.getElementById('addEventBtn');
        const addStateBtn = document.getElementById('addStateBtn');
        
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.addEvent());
        } else {
            console.error('addEventBtn not found');
        }
        
        if (addStateBtn) {
            addStateBtn.addEventListener('click', () => this.addState());
        } else {
            console.error('addStateBtn not found');
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Sidebar tab switching
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSidebarTab(e.target.dataset.sidebarTab));
        });

        // Variable search
        document.getElementById('variableSearch').addEventListener('input', (e) => {
            this.filterVariables(e.target.value);
        });

        // Modal event listeners
        this.setupModalListeners();

        // Drag and drop setup
        this.setupDragAndDrop();
    }

    setupModalListeners() {
        // Variable modal
        const variableModal = document.getElementById('variableModal');
        const closeVariableModal = document.getElementById('closeVariableModal');
        const cancelVariableBtn = document.getElementById('cancelVariableBtn');
        const saveVariableBtn = document.getElementById('saveVariableBtn');

        closeVariableModal.addEventListener('click', () => {
            // Clean up event listeners
            const typeSelect = document.getElementById('variableType');
            if (typeSelect && typeSelect._changeHandler) {
                typeSelect.removeEventListener('change', typeSelect._changeHandler);
                delete typeSelect._changeHandler;
            }
            this.hideModal('variableModal');
        });
        cancelVariableBtn.addEventListener('click', () => {
            // Clean up event listeners
            const typeSelect = document.getElementById('variableType');
            if (typeSelect && typeSelect._changeHandler) {
                typeSelect.removeEventListener('change', typeSelect._changeHandler);
                delete typeSelect._changeHandler;
            }
            this.hideModal('variableModal');
        });
        saveVariableBtn.addEventListener('click', () => {
            // Clean up event listeners before saving
            const typeSelect = document.getElementById('variableType');
            if (typeSelect && typeSelect._changeHandler) {
                typeSelect.removeEventListener('change', typeSelect._changeHandler);
                delete typeSelect._changeHandler;
            }
            this.saveVariable();
        });

        // Element modal
        const elementModal = document.getElementById('elementModal');
        const closeElementModal = document.getElementById('closeElementModal');

        closeElementModal.addEventListener('click', () => this.hideModal('elementModal'));
        
        // Element type selection
        document.querySelectorAll('.element-type').forEach(type => {
            type.addEventListener('click', (e) => {
                const elementType = e.currentTarget.dataset.type;
                this.addElement(elementType);
                this.hideModal('elementModal');
            });
        });

        // Test modal
        const testModal = document.getElementById('testModal');
        const closeTestModal = document.getElementById('closeTestModal');
        closeTestModal.addEventListener('click', () => this.hideModal('testModal'));

        // Event modal
        const eventModal = document.getElementById('eventModal');
        const closeEventModal = document.getElementById('closeEventModal');
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        const saveEventBtn = document.getElementById('saveEventBtn');

        closeEventModal.addEventListener('click', () => {
            // Clean up event listeners
            const elementSelect = document.getElementById('eventElement');
            if (elementSelect && elementSelect._changeHandler) {
                elementSelect.removeEventListener('change', elementSelect._changeHandler);
                delete elementSelect._changeHandler;
            }
            const actionSelect = document.getElementById('eventAction');
            if (actionSelect && actionSelect._changeHandler) {
                actionSelect.removeEventListener('change', actionSelect._changeHandler);
                delete actionSelect._changeHandler;
            }
            this.hideModal('eventModal');
        });
        cancelEventBtn.addEventListener('click', () => {
            // Clean up event listeners
            const elementSelect = document.getElementById('eventElement');
            if (elementSelect && elementSelect._changeHandler) {
                elementSelect.removeEventListener('change', elementSelect._changeHandler);
                delete elementSelect._changeHandler;
            }
            const actionSelect = document.getElementById('eventAction');
            if (actionSelect && actionSelect._changeHandler) {
                actionSelect.removeEventListener('change', actionSelect._changeHandler);
                delete actionSelect._changeHandler;
            }
            this.hideModal('eventModal');
        });
        saveEventBtn.addEventListener('click', () => this.saveEvent());

        // State modal
        const stateModal = document.getElementById('stateModal');
        const closeStateModal = document.getElementById('closeStateModal');
        const cancelStateBtn = document.getElementById('cancelStateBtn');
        const saveStateBtn = document.getElementById('saveStateBtn');

        closeStateModal.addEventListener('click', () => {
            // Clean up event listeners
            const operatorSelect = document.getElementById('stateOperator');
            if (operatorSelect && operatorSelect._operatorChangeHandler) {
                operatorSelect.removeEventListener('change', operatorSelect._operatorChangeHandler);
                delete operatorSelect._operatorChangeHandler;
            }
            const compareTypeSelect = document.getElementById('compareType');
            if (compareTypeSelect && compareTypeSelect._changeHandler) {
                compareTypeSelect.removeEventListener('change', compareTypeSelect._changeHandler);
                delete compareTypeSelect._changeHandler;
            }
            this.hideModal('stateModal');
        });
        cancelStateBtn.addEventListener('click', () => {
            // Clean up event listeners
            const operatorSelect = document.getElementById('stateOperator');
            if (operatorSelect && operatorSelect._operatorChangeHandler) {
                operatorSelect.removeEventListener('change', operatorSelect._operatorChangeHandler);
                delete operatorSelect._operatorChangeHandler;
            }
            const compareTypeSelect = document.getElementById('compareType');
            if (compareTypeSelect && compareTypeSelect._changeHandler) {
                compareTypeSelect.removeEventListener('change', compareTypeSelect._changeHandler);
                delete compareTypeSelect._changeHandler;
            }
            this.hideModal('stateModal');
        });
        saveStateBtn.addEventListener('click', () => {
            // Clean up event listeners before saving
            const operatorSelect = document.getElementById('stateOperator');
            if (operatorSelect && operatorSelect._operatorChangeHandler) {
                operatorSelect.removeEventListener('change', operatorSelect._operatorChangeHandler);
                delete operatorSelect._operatorChangeHandler;
            }
            const compareTypeSelect = document.getElementById('compareType');
            if (compareTypeSelect && compareTypeSelect._changeHandler) {
                compareTypeSelect.removeEventListener('change', compareTypeSelect._changeHandler);
                delete compareTypeSelect._changeHandler;
            }
            this.saveState();
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    // Clean up event listeners for modals
                    if (modal.id === 'variableModal') {
                        const typeSelect = document.getElementById('variableType');
                        if (typeSelect && typeSelect._changeHandler) {
                            typeSelect.removeEventListener('change', typeSelect._changeHandler);
                            delete typeSelect._changeHandler;
                        }
                    } else if (modal.id === 'stateModal') {
                        const operatorSelect = document.getElementById('stateOperator');
                        if (operatorSelect && operatorSelect._operatorChangeHandler) {
                            operatorSelect.removeEventListener('change', operatorSelect._operatorChangeHandler);
                            delete operatorSelect._operatorChangeHandler;
                        }
                        const compareTypeSelect = document.getElementById('compareType');
                        if (compareTypeSelect && compareTypeSelect._changeHandler) {
                            compareTypeSelect.removeEventListener('change', compareTypeSelect._changeHandler);
                            delete compareTypeSelect._changeHandler;
                        }
                    } else if (modal.id === 'eventModal') {
                        const elementSelect = document.getElementById('eventElement');
                        if (elementSelect && elementSelect._changeHandler) {
                            elementSelect.removeEventListener('change', elementSelect._changeHandler);
                            delete elementSelect._changeHandler;
                        }
                        const actionSelect = document.getElementById('eventAction');
                        if (actionSelect && actionSelect._changeHandler) {
                            actionSelect.removeEventListener('change', actionSelect._changeHandler);
                            delete actionSelect._changeHandler;
                        }
                    }
                    this.hideModal(modal.id);
                }
            });
        });
    }

    setupDragAndDrop() {
        // This will be called after variables are rendered
        // to set up drag functionality for variable items
    }

    makeVariableDraggable(element, variable) {
        element.draggable = true;
        element.classList.add('draggable');
        
        element.addEventListener('dragstart', (e) => {
            element.classList.add('dragging');
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'variable',
                data: variable
            }));
            this.logDebug(`Started dragging variable: ${variable.name}`, 'info');
        });
        
        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.logDebug(`Switched to tab: ${tabName}`, 'info');
    }

    switchSidebarTab(tabName) {
        // Update sidebar tab buttons
        document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sidebar-tab="${tabName}"]`).classList.add('active');

        // Update sidebar tab content
        document.querySelectorAll('.sidebar-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}TabContent`).classList.add('active');

        this.logDebug(`Switched to sidebar tab: ${tabName}`, 'info');
    }

    renderVariables() {
        const variablesList = document.getElementById('variablesList');
        variablesList.innerHTML = '';

        this.globalVariables.forEach(variable => {
            const variableElement = this.createVariableElement(variable);
            variablesList.appendChild(variableElement);
        });
    }

    createVariableElement(variable) {
        const element = document.createElement('div');
        element.className = 'variable-item';
        element.dataset.variableId = variable.id;
        
        element.innerHTML = `
            <div class="variable-header">
                <div class="variable-name">${variable.name}</div>
                <div class="variable-actions">
                    <div class="variable-type">${this.getTypeIcon(variable.type)} ${variable.type}</div>
                    <button class="edit-btn" data-variable-id="${variable.id}" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="variable-value">Current: ${this.formatValue(variable.current_value)}</div>
        `;
        
        // Make draggable
        this.makeVariableDraggable(element, variable);
        
        // Add edit button handler
        const editBtn = element.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editVariable(variable.id);
        });
        
        return element;
    }

    getTypeIcon(type) {
        const icons = {
            'String': '📝',
            'Number': '🔢',
            'NumberVariable': '📊',
            'Boolean': '☑️',
            'Date': '📅',
            'Array': '📚',
            'Object': '🗂️'
        };
        return icons[type] || '❓';
    }

    formatValue(value) {
        if (typeof value === 'string' && value.length > 30) {
            return value.substring(0, 30) + '...';
        }
        return String(value);
    }

    selectVariable(variable) {
        // Clear previous selection
        document.querySelectorAll('.variable-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select current variable
        document.querySelector(`[data-variable-id="${variable.id}"]`).classList.add('selected');
        
        this.selectedItem = { type: 'variable', data: variable };
        this.updatePropertiesPanel();
        this.logDebug(`Selected variable: ${variable.name}`, 'info');
    }

    renderElements() {
        const elementsGrid = document.getElementById('elementsGrid');
        elementsGrid.innerHTML = '';

        this.visualElements.forEach(element => {
            const elementCard = this.createElementCard(element);
            elementsGrid.appendChild(elementCard);
        });
    }

    createElementCard(element) {
        const card = document.createElement('div');
        card.className = 'element-card';
        card.dataset.elementId = element.id;
        
        card.innerHTML = `
            <div class="element-header">
                <span class="element-icon">${element.icon}</span>
                <span class="element-title">${element.name}</span>
                <span class="element-type-badge">${element.type}</span>
            </div>
            <div class="element-properties">
                ${this.renderElementProperties(element.properties)}
            </div>
        `;
        
        // Click to select
        card.addEventListener('click', () => this.selectElement(element));
        
        return card;
    }

    renderElementProperties(properties) {
        return Object.entries(properties).slice(0, 3).map(([key, value]) => 
            `<div><strong>${key}:</strong> ${this.formatValue(value)}</div>`
        ).join('');
    }

    selectElement(element) {
        // Clear previous selection
        document.querySelectorAll('.element-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select current element
        document.querySelector(`[data-element-id="${element.id}"]`).classList.add('selected');
        
        this.selectedItem = { type: 'element', data: element };
        this.updatePropertiesPanel();
        this.logDebug(`Selected element: ${element.name}`, 'info');
    }


    selectEvent(event) {
        // Clear previous selection
        document.querySelectorAll('.event-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select current event
        document.querySelector(`[data-event-id="${event.id}"]`).classList.add('selected');
        
        this.selectedItem = { type: 'event', data: event };
        this.updatePropertiesPanel();
        this.logDebug(`Selected event: ${event.name}`, 'info');
    }

    selectState(state) {
        // Clear previous selection
        document.querySelectorAll('.state-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select current state
        document.querySelector(`[data-state-id="${state.id}"]`).classList.add('selected');
        
        this.selectedItem = { type: 'state', data: state };
        this.updatePropertiesPanel();
        this.logDebug(`Selected state: ${state.name}`, 'info');
    }

    updatePropertiesPanel() {
        // Properties panel has been removed - properties are now edited via edit buttons
        // This method is kept as a no-op for compatibility
        return;
    }

    renderVariableProperties(variable) {
        let additionalInfo = '';
        
        if (variable.type === 'NumberVariable' && variable.store) {
            const thresholdVar = variable.store.thresholdValue ? this.globalVariables.find(v => v.id === variable.store.thresholdValue) : null;
            const budgetVar = variable.store.budgetValue ? this.globalVariables.find(v => v.id === variable.store.budgetValue) : null;
            
            additionalInfo = `
            <div class="property-group">
                <h4>Number Variable Configuration</h4>
                ${thresholdVar ? `<div class="property-row">
                    <span class="property-label">Threshold Variable</span>
                    <span class="property-value">${thresholdVar.name}</span>
                </div>` : ''}
                ${budgetVar ? `<div class="property-row">
                    <span class="property-label">Budget Variable</span>
                    <span class="property-value">${budgetVar.name}</span>
                </div>` : ''}
                ${variable.wiringConfig ? `<div class="property-row">
                    <span class="property-label">Threshold Source</span>
                    <span class="property-value">${variable.wiringConfig.thresholdSource === 'budgetValue' ? 'Budget Value' : 'Fixed Value'}</span>
                </div>` : ''}
            </div>`;
        }
        
        return `
            <div class="property-group">
                <h4>Variable Details</h4>
                <div class="property-row">
                    <span class="property-label">ID</span>
                    <span class="property-value">${variable.id}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Type</span>
                    <span class="property-value">${variable.type}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Default Value</span>
                    <span class="property-value">${this.formatValue(variable.default_value)}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Current Value</span>
                    <span class="property-value">${this.formatValue(variable.current_value)}</span>
                </div>
            </div>
            ${additionalInfo}
            <div class="property-group">
                <h4>Description</h4>
                <p>${variable.description}</p>
            </div>
            <div class="property-group">
                <button class="btn btn--primary btn--sm btn--full-width" onclick="app.editVariable('${variable.id}')">Edit Variable</button>
                <button class="btn btn--outline btn--sm btn--full-width" style="margin-top: 8px;" onclick="app.deleteVariable('${variable.id}')">Delete Variable</button>
            </div>
        `;
    }

    renderElementPropertiesPanel(element) {
        return `
            <div class="property-group">
                <h4>Element Details</h4>
                <div class="property-row">
                    <span class="property-label">ID</span>
                    <span class="property-value">${element.id}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Type</span>
                    <span class="property-value">${element.type}</span>
                </div>
            </div>
            <div class="property-group">
                <h4>Properties</h4>
                ${Object.entries(element.properties).map(([key, value]) => `
                    <div class="property-row">
                        <span class="property-label">${key}</span>
                        <span class="property-value">${this.formatValue(value)}</span>
                    </div>
                `).join('')}
            </div>
            ${element.events ? `
                <div class="property-group">
                    <h4>Events</h4>
                    ${element.events.map(event => `
                        <div class="property-row">
                            <span class="property-label">${event.type}</span>
                            <span class="property-value">${event.action} → ${event.target}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    renderEventProperties(event) {
        const targetVariable = this.globalVariables.find(v => v.id === event.target);
        const targetName = targetVariable ? targetVariable.name : event.target;
        
        return `
            <div class="property-group">
                <h4>Event Details</h4>
                <div class="property-row">
                    <span class="property-label">ID</span>
                    <span class="property-value">${event.id}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Trigger</span>
                    <span class="property-value">${event.trigger}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Action</span>
                    <span class="property-value">${event.action}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Target</span>
                    <span class="property-value">${targetName}</span>
                </div>
            </div>
            ${event.category ? `
                <div class="property-group">
                    <h4>Category</h4>
                    <p>${event.category}</p>
                </div>
            ` : ''}
            <div class="property-group">
                <button class="btn btn--primary btn--sm btn--full-width" onclick="app.editEvent('${event.id}')">Edit Event</button>
                <button class="btn btn--outline btn--sm btn--full-width" style="margin-top: 8px;" onclick="app.deleteEvent('${event.id}')">Delete Event</button>
            </div>
        `;
    }

    renderStateProperties(state) {
        // Parse the condition to show readable information
        const conditionParts = state.condition.split(' ');
        let conditionDisplay = state.condition;
        
        if (conditionParts.length >= 3) {
            const variableId = conditionParts[0];
            const operator = conditionParts[1];
            const compareValue = conditionParts.slice(2).join(' ');
            
            const variable = this.globalVariables.find(v => v.id === variableId);
            const variableName = variable ? variable.name : variableId;
            
            let compareDisplay;
            if (state.compareType === 'variable') {
                const compareVar = this.globalVariables.find(v => v.id === compareValue);
                compareDisplay = compareVar ? compareVar.name : compareValue;
            } else {
                compareDisplay = compareValue;
            }
            
            conditionDisplay = `${variableName} ${operator} ${compareDisplay}`;
        }
        
        return `
            <div class="property-group">
                <h4>State Details</h4>
                <div class="property-row">
                    <span class="property-label">ID</span>
                    <span class="property-value">${state.id}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Condition</span>
                    <span class="property-value">${conditionDisplay}</span>
                </div>
                <div class="property-row">
                    <span class="property-label">Effects</span>
                    <span class="property-value">${state.effects.length} element(s)</span>
                </div>
            </div>
            ${state.category ? `
                <div class="property-group">
                    <h4>Category</h4>
                    <p>${state.category}</p>
                </div>
            ` : ''}
            <div class="property-group">
                <button class="btn btn--primary btn--sm btn--full-width" onclick="app.editState('${state.id}')">Edit State</button>
                <button class="btn btn--outline btn--sm btn--full-width" style="margin-top: 8px;" onclick="app.deleteState('${state.id}')">Delete State</button>
            </div>
        `;
    }

    renderEvents() {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';
        
        this.events.forEach(event => {
            const eventElement = this.createEventElement(event);
            eventsList.appendChild(eventElement);
        });
    }

    createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'event-item';
        element.dataset.eventId = event.id;
        
        // Get target variable name
        const targetVariable = this.globalVariables.find(v => v.id === event.target);
        const targetName = targetVariable ? targetVariable.name : event.target;
        
        element.innerHTML = `
            <div class="event-header">
                <span class="event-name">⚡ ${event.name}</span>
                <div class="event-actions">
                    <span class="status status--info">${event.action}</span>
                    <button class="edit-btn" data-event-id="${event.id}" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="event-trigger">Trigger: ${event.trigger.replace('element.', '')}</div>
            <div class="event-trigger">Target: ${targetName}</div>
        `;
        
        // Add edit button handler
        const editBtn = element.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editEvent(event.id);
        });
        
        return element;
    }

    renderStates() {
        const statesList = document.getElementById('statesList');
        statesList.innerHTML = '';
        
        this.states.forEach(state => {
            const stateElement = this.createStateElement(state);
            statesList.appendChild(stateElement);
        });
    }

    createStateElement(state) {
        const element = document.createElement('div');
        element.className = 'state-item';
        element.dataset.stateId = state.id;
        
        // Get state category icon
        const categoryIcon = this.getStateCategoryIcon(state.category);
        
        // Parse the condition to show readable information
        const conditionParts = state.condition.split(' ');
        if (conditionParts.length >= 3) {
            const variableId = conditionParts[0];
            const operator = conditionParts[1];
            const compareValue = conditionParts.slice(2).join(' ');
            
            const variable = this.globalVariables.find(v => v.id === variableId);
            const variableName = variable ? variable.name : variableId;
            
            let compareDisplay;
            if (state.compareType === 'variable') {
                // It's comparing against another variable
                const compareVar = this.globalVariables.find(v => v.id === compareValue);
                compareDisplay = compareVar ? compareVar.name : compareValue;
            } else {
                // It's comparing against a value
                compareDisplay = compareValue;
            }
            
            element.innerHTML = `
                <div class="state-header">
                    <span class="state-name">${categoryIcon} ${state.name}</span>
                    <div class="state-actions">
                        <span class="status status--success">Active</span>
                        <button class="edit-btn" data-state-id="${state.id}" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="state-condition">When: ${variableName} ${operator} ${compareDisplay}</div>
                <div class="state-condition">Effects: ${state.effects.length} element(s)</div>
                ${state.category ? `<div class="state-category">Category: ${state.category}</div>` : ''}
            `;
        } else {
            element.innerHTML = `
                <div class="state-header">
                    <span class="state-name">${categoryIcon} ${state.name}</span>
                    <div class="state-actions">
                        <span class="status status--success">Active</span>
                        <button class="edit-btn" data-state-id="${state.id}" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="state-condition">Condition: ${state.condition}</div>
                <div class="state-condition">Effects: ${state.effects.length} element(s)</div>
                ${state.category ? `<div class="state-category">Category: ${state.category}</div>` : ''}
            `;
        }
        
        // Add edit button handler
        const editBtn = element.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editState(state.id);
        });
        
        return element;
    }

    getStateCategoryIcon(category) {
        switch (category) {
            case 'Filter':
                return '🔽';
            case 'Bookmark':
                return '🔖';
            case 'Navigation':
                return '🧭';
            default:
                return '🎯';
        }
    }

    getEventCategoryIcon(category) {
        switch (category) {
            case 'Filter':
                return '🔽';
            case 'Bookmark':
                return '🔖';
            case 'Navigation':
                return '🧭';
            case 'General':
                return '⚡';
            default:
                return '⚡';
        }
    }

    showVariableModal(variableId = null) {
        const modal = document.getElementById('variableModal');
        const title = document.getElementById('variableModalTitle');
        const form = document.getElementById('variableForm');
        const typeSelect = document.getElementById('variableType');
        
        if (variableId) {
            // Edit mode
            const variable = this.globalVariables.find(v => v.id === variableId);
            title.textContent = 'Edit Variable';
            
            document.getElementById('variableName').value = variable.name;
            document.getElementById('variableType').value = variable.type;
            document.getElementById('variableDefault').value = variable.default_value;
            document.getElementById('variableDescription').value = variable.description;

            // Handle NumberVariable specific fields
            if (variable.type === 'NumberVariable' && variable.store) {
                document.getElementById('thresholdVariable').value = variable.store.thresholdValue || '';
                document.getElementById('budgetVariable').value = variable.store.budgetValue || '';
                document.getElementById('thresholdSource').value = variable.wiringConfig?.thresholdSource || 'fixed';
            }
        } else {
            // Add mode
            title.textContent = 'Add Variable';
            form.reset();
        }
        
        // Populate variable dropdowns for NumberVariable fields
        this.populateVariableSelectForNumberVar('thresholdVariable');
        this.populateVariableSelectForNumberVar('budgetVariable');
        
        // Set up type change handler
        const handleTypeChange = (e) => {
            this.handleVariableTypeChange(e.target.value);
        };
        typeSelect.addEventListener('change', handleTypeChange);
        
        // Store reference for cleanup
        typeSelect._changeHandler = handleTypeChange;
        
        // Initialize fields based on current type
        const currentType = variableId ? this.globalVariables.find(v => v.id === variableId).type : 'String';
        this.handleVariableTypeChange(currentType);
        
        this.showModal('variableModal');
    }

    showElementModal() {
        this.showModal('elementModal');
    }

    showEventModal() {
        const title = document.getElementById('eventModalTitle');
        const form = document.getElementById('eventForm');
        const targetSelect = document.getElementById('eventTarget');
        const elementSelect = document.getElementById('eventElement');
        const actionSelect = document.getElementById('eventAction');
        
        title.textContent = 'Add Event';
        form.reset();
        
        // Populate element dropdown
        this.populateElementSelect(elementSelect);
        
        // Populate target variable dropdown
        this.populateVariableSelect(targetSelect);
        
        // Set up element change handler for dynamic triggers
        const handleElementChange = (e) => {
            this.updateTriggerOptions(e.target.value);
        };
        elementSelect.addEventListener('change', handleElementChange);
        
        // Store reference for cleanup
        elementSelect._changeHandler = handleElementChange;
        
        // Set up action change handler for conditional value field
        const handleActionChange = (e) => {
            this.handleEventActionChange(e.target.value);
        };
        actionSelect.addEventListener('change', handleActionChange);
        
        // Store reference for cleanup
        actionSelect._changeHandler = handleActionChange;
        
        // Initialize trigger options with first element
        if (this.visualElements.length > 0) {
            this.updateTriggerOptions(this.visualElements[0].id);
        }
        
        // Initialize action field display
        this.handleEventActionChange('update_variable');
        
        // Reset editing flag
        delete this.editingEvent;
        
        this.showModal('eventModal');
    }

    showStateModal() {
        const title = document.getElementById('stateModalTitle');
        const form = document.getElementById('stateForm');
        const variableSelect = document.getElementById('stateVariable');
        const operatorSelect = document.getElementById('stateOperator');
        const compareTypeSelect = document.getElementById('compareType');
        const compareVariableSelect = document.getElementById('compareVariable');
        
        title.textContent = 'Add State';
        form.reset();
        
        // Populate variable dropdowns
        this.populateVariableSelect(variableSelect);
        this.populateVariableSelect(compareVariableSelect);
        
        // Set up operator change handler
        const handleOperatorChange = (e) => {
            this.handleOperatorChange(e.target.value);
        };
        operatorSelect.addEventListener('change', handleOperatorChange);
        operatorSelect._operatorChangeHandler = handleOperatorChange;
        
        // Set up compare type change handler
        const handleCompareTypeChange = (e) => {
            this.handleCompareTypeChange(e.target.value);
        };
        compareTypeSelect.addEventListener('change', handleCompareTypeChange);
        
        // Store reference for cleanup
        compareTypeSelect._changeHandler = handleCompareTypeChange;
        
        // Initialize with value input visible
        this.handleOperatorChange('==');
        this.handleCompareTypeChange('value');
        
        // Initialize editing state with empty effects array for new state
        this.editingState = {
            effects: []
        };
        
        // Render the state changes list
        this.renderStateChangesList();
        
        this.showModal('stateModal');
    }

    renderStateChangesList() {
        const stateChangesList = document.getElementById('stateChangesList');
        stateChangesList.innerHTML = '';

        // If we're in the state modal, show configurable form for the current state
        if (this.editingState || document.getElementById('stateModal').classList.contains('active')) {
            this.renderStateEffectsForm(stateChangesList);
            return;
        }

        // Otherwise, show the read-only list of all state changes from existing states
        const stateChanges = [];

        this.states.forEach(state => {
            state.effects.forEach(effect => {
                const element = this.visualElements.find(el => el.id === effect.element);
                if (element) {
                    stateChanges.push({
                        stateName: state.name,
                        elementName: element.name,
                        elementIcon: element.icon,
                        properties: effect.properties
                    });
                }
            });
        });

        if (stateChanges.length === 0) {
            stateChangesList.innerHTML = '<div class="no-changes">No state changes defined yet. States will be applied when conditions match.</div>';
            return;
        }

        stateChanges.forEach(change => {
            const changeItem = document.createElement('div');
            changeItem.className = 'state-change-item';

            const propertiesHtml = Object.entries(change.properties).map(([key, value]) => {
                const oldValue = this.getElementProperty(change.elementName, key);
                return `
                    <div class="property-change">
                        <span class="property-label">${key}:</span>
                        <span class="property-value">
                            ${oldValue ? `<span class="property-old">${this.formatValue(oldValue)}</span> → ` : ''}
                            <span class="property-new">${this.formatValue(value)}</span>
                        </span>
                    </div>
                `;
            }).join('');

            changeItem.innerHTML = `
                <div class="state-change-element">
                    <span class="element-icon">${change.elementIcon}</span>
                    <span class="element-name">${change.elementName}</span>
                </div>
                <div class="state-change-properties">
                    ${propertiesHtml}
                </div>
            `;

            stateChangesList.appendChild(changeItem);
        });
    }

    renderStateEffectsForm(container) {
        const currentState = this.editingState;

        // Clear container
        container.innerHTML = '';

        // Add header with "Add Effect" button
        const headerDiv = document.createElement('div');
        headerDiv.className = 'state-effects-header';
        headerDiv.innerHTML = `
            <h5>State Effects</h5>
            <button type="button" class="btn btn--primary btn--sm" id="addEffectBtn">
                + Add Effect
            </button>
        `;
        container.appendChild(headerDiv);

        // Effects list container
        const effectsList = document.createElement('div');
        effectsList.className = 'state-effects-list';
        effectsList.id = 'stateEffectsList';
        container.appendChild(effectsList);

        // Add existing effects or empty message
        const effects = currentState ? currentState.effects : [];
        if (effects.length === 0) {
            effectsList.innerHTML = '<div class="no-effects">No effects added yet. Click "Add Effect" to configure visual changes.</div>';
        } else {
            effects.forEach((effect, index) => {
                this.addEffectItem(effectsList, effect, index);
            });
        }

        // Add event listener for the add button
        document.getElementById('addEffectBtn').addEventListener('click', () => {
            this.addNewEffect();
        });
    }

    addEffectItem(container, effect, index) {
        const effectItem = document.createElement('div');
        effectItem.className = 'state-effect-item';
        effectItem.dataset.effectIndex = index;

        const element = this.visualElements.find(el => el.id === effect.element);

        effectItem.innerHTML = `
            <div class="state-effect-header">
                <select class="form-control element-select" data-effect-index="${index}">
                    <option value="">Select element...</option>
                    ${this.visualElements.map(el => `
                        <option value="${el.id}" ${el.id === effect.element ? 'selected' : ''}>
                            ${el.icon} ${el.name} (${el.type})
                        </option>
                    `).join('')}
                </select>
                <button type="button" class="btn btn--outline btn--sm remove-effect-btn" data-effect-index="${index}">
                    Remove
                </button>
            </div>
            <div class="state-effect-properties" data-effect-index="${index}">
                ${element ? this.generateElementPropertiesForm(element, effect) : '<div class="no-properties">Select an element to configure properties</div>'}
            </div>
        `;

        container.appendChild(effectItem);

        // Add event listeners
        const elementSelect = effectItem.querySelector('.element-select');
        elementSelect.addEventListener('change', (e) => {
            this.updateEffectProperties(e.target.value, index);
        });

        const removeBtn = effectItem.querySelector('.remove-effect-btn');
        removeBtn.addEventListener('click', () => {
            this.removeEffect(index);
        });
    }

    addNewEffect() {
        const currentState = this.editingState;
        if (!currentState) return;

        // Add empty effect
        currentState.effects.push({
            element: '',
            properties: {}
        });

        // Re-render the effects form
        const container = document.getElementById('stateChangesList');
        this.renderStateEffectsForm(container);
    }

    updateEffectProperties(elementId, effectIndex) {
        const currentState = this.editingState;
        if (!currentState) return;

        const element = this.visualElements.find(el => el.id === elementId);
        const propertiesContainer = document.querySelector(`.state-effect-properties[data-effect-index="${effectIndex}"]`);

        if (element) {
            // Update the effect's element
            currentState.effects[effectIndex].element = elementId;

            // Generate new properties form
            propertiesContainer.innerHTML = this.generateElementPropertiesForm(element, currentState.effects[effectIndex]);
        } else {
            propertiesContainer.innerHTML = '<div class="no-properties">Select an element to configure properties</div>';
        }
    }

    removeEffect(effectIndex) {
        const currentState = this.editingState;
        if (!currentState) return;

        // Remove the effect
        currentState.effects.splice(effectIndex, 1);

        // Re-render the effects form
        const container = document.getElementById('stateChangesList');
        this.renderStateEffectsForm(container);
    }

    generateElementPropertiesForm(element, existingEffect) {
        if (!element.properties) return '';

        return Object.keys(element.properties).map(propKey => {
            const currentValue = element.properties[propKey];
            const effectValue = existingEffect ? existingEffect.properties[propKey] : '';

            return `
                <div class="property-form-row">
                    <label class="property-form-label">${propKey}:</label>
                    <input type="text"
                           class="form-control property-input"
                           data-property="${propKey}"
                           placeholder="Current: ${this.formatValue(currentValue)}"
                           value="${effectValue ? this.formatValue(effectValue) : ''}">
                </div>
            `;
        }).join('');
    }

    getElementProperty(elementName, propertyKey) {
        const element = this.visualElements.find(el => el.name === elementName);
        if (element && element.properties) {
            return element.properties[propertyKey];
        }
        return null;
    }

    populateVariableSelect(selectElement) {
        selectElement.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a variable...';
        selectElement.appendChild(defaultOption);
        
        // Add all variables
        this.globalVariables.forEach(variable => {
            const option = document.createElement('option');
            option.value = variable.id;
            option.textContent = `${variable.name} (${variable.type})`;
            selectElement.appendChild(option);
        });
    }

    populateVariableSelectForNumberVar(selectId) {
        const selectElement = document.getElementById(selectId);
        // Clear existing options except the first one
        while (selectElement.children.length > 1) {
            selectElement.removeChild(selectElement.lastChild);
        }
        
        // Add all variables
        this.globalVariables.forEach(variable => {
            const option = document.createElement('option');
            option.value = variable.id;
            option.textContent = `${variable.name} (${variable.type})`;
            selectElement.appendChild(option);
        });
    }

    populateElementSelect(selectElement) {
        selectElement.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an element...';
        selectElement.appendChild(defaultOption);
        
        // Add all visual elements
        this.visualElements.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = `${element.icon} ${element.name} (${element.type})`;
            selectElement.appendChild(option);
        });
    }

    updateTriggerOptions(elementId) {
        const triggerSelect = document.getElementById('eventTrigger');
        triggerSelect.innerHTML = '';
        
        if (!elementId) {
            // No element selected, show default options
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select an element first...';
            triggerSelect.appendChild(defaultOption);
            return;
        }
        
        // Find the selected element
        const element = this.visualElements.find(el => el.id === elementId);
        if (!element) return;
        
        // Get available triggers for this element type
        const triggers = this.getTriggersForElementType(element.type);
        
        // Add trigger options
        triggers.forEach(trigger => {
            const option = document.createElement('option');
            option.value = trigger.value;
            option.textContent = trigger.label;
            triggerSelect.appendChild(option);
        });
    }

    getTriggersForElementType(elementType) {
        const triggerMap = {
            'Chart': [
                { value: 'onClick', label: 'Chart Click' },
                { value: 'onHover', label: 'Chart Hover' },
                { value: 'onDrillThrough', label: 'Drill Through' }
            ],
            'KPI': [
                { value: 'onClick', label: 'KPI Click' },
                { value: 'onHover', label: 'KPI Hover' }
            ],
            'Filter': [
                { value: 'onChange', label: 'Filter Change' },
                { value: 'onApply', label: 'Filter Apply' },
                { value: 'onClear', label: 'Filter Clear' }
            ],
            'Table': [
                { value: 'onRowClick', label: 'Row Click' },
                { value: 'onSort', label: 'Column Sort' },
                { value: 'onPageChange', label: 'Page Change' }
            ],
            'Button': [
                { value: 'onClick', label: 'Button Click' },
                { value: 'onHover', label: 'Button Hover' }
            ]
        };
        
        return triggerMap[elementType] || [{ value: 'onClick', label: 'Click' }];
    }

    handleEventActionChange(action) {
        const updateValueGroup = document.getElementById('updateValueGroup');
        const eventValue = document.getElementById('eventValue');
        
        if (action === 'update_variable') {
            updateValueGroup.style.display = 'block';
            eventValue.required = true;
        } else {
            updateValueGroup.style.display = 'none';
            eventValue.required = false;
            eventValue.value = '';
        }
    }

    handleVariableTypeChange(type) {
        const numberVariableFields = document.getElementById('numberVariableFields');
        
        if (type === 'NumberVariable') {
            numberVariableFields.style.display = 'block';
        } else {
            numberVariableFields.style.display = 'none';
        }
    }

    handleOperatorChange(operator) {
        const compareTypeGroup = document.getElementById('compareType').closest('.form-group');
        const valueGroup = document.getElementById('valueGroup');
        const variableGroup = document.getElementById('variableGroup');
        
        if (operator === 'onChange') {
            // Hide comparison fields for onChange operator
            compareTypeGroup.style.display = 'none';
            valueGroup.style.display = 'none';
            variableGroup.style.display = 'none';
        } else {
            // Show comparison fields for other operators
            compareTypeGroup.style.display = 'block';
            const compareType = document.getElementById('compareType').value;
            this.handleCompareTypeChange(compareType);
        }
    }

    handleCompareTypeChange(compareType) {
        const valueGroup = document.getElementById('valueGroup');
        const variableGroup = document.getElementById('variableGroup');
        const stateValue = document.getElementById('stateValue');
        const compareVariable = document.getElementById('compareVariable');
        
        if (compareType === 'value') {
            valueGroup.style.display = 'block';
            variableGroup.style.display = 'none';
            stateValue.required = true;
            compareVariable.required = false;
        } else {
            valueGroup.style.display = 'none';
            variableGroup.style.display = 'block';
            stateValue.required = false;
            compareVariable.required = true;
        }
    }

    saveEvent() {
        const form = document.getElementById('eventForm');
        const name = document.getElementById('eventName').value;
        const element = document.getElementById('eventElement').value;
        const trigger = document.getElementById('eventTrigger').value;
        const action = document.getElementById('eventAction').value;
        const target = document.getElementById('eventTarget').value;
        const value = document.getElementById('eventValue').value;
        
        if (!name.trim()) {
            alert('Please enter an event name');
            return;
        }
        
        if (!element) {
            alert('Please select an element');
            return;
        }
        
        if (!trigger) {
            alert('Please select a trigger');
            return;
        }
        
        if (!target) {
            alert('Please select a target variable');
            return;
        }
        
        if (action === 'update_variable' && !value.trim()) {
            alert('Please enter a value to update to');
            return;
        }
        
        const fullTrigger = `${element}.${trigger}`;
        
        if (this.editingEvent) {
            // Update existing event
            this.editingEvent.name = name.trim();
            this.editingEvent.trigger = fullTrigger;
            this.editingEvent.action = action;
            this.editingEvent.target = target;
            this.editingEvent.parameters = action === 'update_variable' ? { value: value.trim() } : {};
            
            this.logDebug(`Updated event: ${this.editingEvent.name}`, 'success');
            delete this.editingEvent;
        } else {
            // Create new event
            const event = {
                id: `event_${Date.now()}`,
                name: name.trim(),
                trigger: fullTrigger,
                action: action,
                target: target,
                parameters: action === 'update_variable' ? { value: value.trim() } : {}
            };
            
            this.events.push(event);
            this.logDebug(`Added new event: ${event.name}`, 'success');
        }
        
        this.renderEvents();
        this.hideModal('eventModal');
    }

    saveState() {
        const form = document.getElementById('stateForm');
        const name = document.getElementById('stateName').value;
        const variable = document.getElementById('stateVariable').value;
        const operator = document.getElementById('stateOperator').value;
        const compareType = document.getElementById('compareType').value;
        const value = document.getElementById('stateValue').value;
        const compareVariable = document.getElementById('compareVariable').value;
        
        if (!name.trim()) {
            alert('Please enter a state name');
            return;
        }
        
        if (!variable) {
            alert('Please select a variable');
            return;
        }
        
        let compareValue;
        let condition;
        
        if (operator === 'onChange') {
            // For onChange operator, no comparison value needed
            condition = `${variable} onChange`;
        } else {
            // For other operators, require comparison value
            if (compareType === 'value') {
                if (!value.trim()) {
                    alert('Please enter a condition value');
                    return;
                }
                compareValue = value.trim();
            } else {
                if (!compareVariable) {
                    alert('Please select a variable to compare against');
                    return;
                }
                compareValue = compareVariable;
            }
            
            // Build the condition string
            condition = `${variable} ${operator} ${compareValue}`;
        }
        
        // Collect effects from the form
        const effects = this.collectStateEffects();
        
        if (this.editingState) {
            // Update existing state
            this.editingState.name = name.trim();
            this.editingState.condition = condition;
            this.editingState.compareType = compareType;
            this.editingState.effects = effects;
            
            this.logDebug(`Updated state: ${this.editingState.name}`, 'success');
            delete this.editingState;
        } else {
            // Create new state
            const state = {
                id: `state_${Date.now()}`,
                name: name.trim(),
                condition: condition,
                compareType: compareType, // Store the compare type for display purposes
                effects: effects
            };
            
            this.states.push(state);
            this.logDebug(`Added new state: ${state.name}`, 'success');
        }
        
        this.renderStates();
        this.hideModal('stateModal');
    }

    collectStateEffects() {
        const effects = [];
        const effectItems = document.querySelectorAll('.state-effect-item');

        effectItems.forEach(item => {
            const effectIndex = item.dataset.effectIndex;
            const elementSelect = item.querySelector('.element-select');
            const elementId = elementSelect.value;

            if (elementId) {
                const properties = {};
                const propertyInputs = item.querySelectorAll('.property-input');

                propertyInputs.forEach(input => {
                    const property = input.dataset.property;
                    const value = input.value.trim();
                    if (value) {
                        properties[property] = value;
                    }
                });

                if (Object.keys(properties).length > 0) {
                    effects.push({
                        element: elementId,
                        properties: properties
                    });
                }
            }
        });

        return effects;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    saveVariable() {
        const form = document.getElementById('variableForm');
        const name = document.getElementById('variableName').value;
        const type = document.getElementById('variableType').value;
        const defaultValue = document.getElementById('variableDefault').value;
        const description = document.getElementById('variableDescription').value;
        
        if (!name.trim()) {
            alert('Please enter a variable name');
            return;
        }
        
        const variable = {
            id: `var_${Date.now()}`,
            name: name.trim(),
            type: type,
            default_value: defaultValue || this.getDefaultValueForType(type),
            current_value: defaultValue || this.getDefaultValueForType(type),
            description: description.trim()
        };
        
        // Handle NumberVariable specific properties
        if (type === 'NumberVariable') {
            const thresholdVariable = document.getElementById('thresholdVariable').value;
            const budgetVariable = document.getElementById('budgetVariable').value;
            const thresholdSource = document.getElementById('thresholdSource').value;
            
            variable.store = {
                selectedVariable: variable.id,
                thresholdValue: thresholdVariable || undefined,
                budgetValue: budgetVariable || undefined
            };
            
            variable.wiringConfig = {
                thresholdSource: thresholdSource
            };
        }
        
        this.globalVariables.push(variable);
        this.renderVariables();
        this.hideModal('variableModal');
        this.logDebug(`Added new variable: ${variable.name}`, 'success');
    }

    getDefaultValueForType(type) {
        const defaults = {
            'String': '',
            'Number': 0,
            'NumberVariable': 0,
            'Boolean': false,
            'Date': '2024-01-01',
            'Array': '[]',
            'Object': '{}'
        };
        return defaults[type] || '';
    }

    editVariable(variableId) {
        this.showVariableModal(variableId);
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const title = document.getElementById('eventModalTitle');
        const form = document.getElementById('eventForm');
        const targetSelect = document.getElementById('eventTarget');
        const elementSelect = document.getElementById('eventElement');
        const actionSelect = document.getElementById('eventAction');
        
        title.textContent = 'Edit Event';
        form.reset();
        
        // Parse the trigger to get element and trigger parts
        const [elementId, triggerValue] = event.trigger.split('.');
        
        // Populate form with existing event data
        document.getElementById('eventName').value = event.name;
        document.getElementById('eventAction').value = event.action;
        document.getElementById('eventTarget').value = event.target;
        
        // Populate element dropdown
        this.populateElementSelect(elementSelect);
        
        // Set the selected element
        elementSelect.value = elementId;
        
        // Populate target variable dropdown
        this.populateVariableSelect(targetSelect);
        
        // Update trigger options for the selected element
        this.updateTriggerOptions(elementId);
        
        // Set the selected trigger
        document.getElementById('eventTrigger').value = triggerValue;
        
        // Set the value if it's an update_variable action
        if (event.action === 'update_variable' && event.parameters && event.parameters.value) {
            document.getElementById('eventValue').value = event.parameters.value;
        }
        
        // Set up element change handler for dynamic triggers
        const handleElementChange = (e) => {
            this.updateTriggerOptions(e.target.value);
        };
        elementSelect.addEventListener('change', handleElementChange);
        
        // Store reference for cleanup
        elementSelect._changeHandler = handleElementChange;
        
        // Set up action change handler for conditional value field
        const handleActionChange = (e) => {
            this.handleEventActionChange(e.target.value);
        };
        actionSelect.addEventListener('change', handleActionChange);
        
        // Store reference for cleanup
        actionSelect._changeHandler = handleActionChange;
        
        // Initialize action field display
        this.handleEventActionChange(event.action);
        
        // Store the event being edited
        this.editingEvent = event;
        
        this.showModal('eventModal');
    }

    editState(stateId) {
        const state = this.states.find(s => s.id === stateId);
        if (!state) return;
        
        const title = document.getElementById('stateModalTitle');
        const form = document.getElementById('stateForm');
        const variableSelect = document.getElementById('stateVariable');
        const compareTypeSelect = document.getElementById('compareType');
        const compareVariableSelect = document.getElementById('compareVariable');
        
        title.textContent = 'Edit State';
        form.reset();
        
        // Populate form with existing state data
        document.getElementById('stateName').value = state.name;
        
        // Parse the condition
        const conditionParts = state.condition.split(' ');
        let operator = '=='; // Default operator
        
        if (conditionParts.length >= 2) {
            const variableId = conditionParts[0];
            operator = conditionParts[1];
            
            document.getElementById('stateVariable').value = variableId;
            document.getElementById('stateOperator').value = operator;
            
            // Set up operator change handler for edit mode
            const operatorSelect = document.getElementById('stateOperator');
            const handleOperatorChange = (e) => {
                this.handleOperatorChange(e.target.value);
            };
            operatorSelect.addEventListener('change', handleOperatorChange);
            operatorSelect._operatorChangeHandler = handleOperatorChange;
            
            // Only set comparison values if not onChange operator
            if (operator !== 'onChange' && conditionParts.length >= 3) {
                const compareValue = conditionParts.slice(2).join(' ');
                
                document.getElementById('compareType').value = state.compareType || 'value';
                
                if (state.compareType === 'variable') {
                    document.getElementById('compareVariable').value = compareValue;
                    document.getElementById('stateValue').value = '';
                } else {
                    document.getElementById('stateValue').value = compareValue;
                    document.getElementById('compareVariable').value = '';
                }
            }
        }
        
        // Populate variable dropdowns
        this.populateVariableSelect(variableSelect);
        this.populateVariableSelect(compareVariableSelect);
        
        // Set up compare type change handler
        const handleCompareTypeChange = (e) => {
            this.handleCompareTypeChange(e.target.value);
        };
        compareTypeSelect.addEventListener('change', handleCompareTypeChange);
        
        // Store reference for cleanup
        compareTypeSelect._changeHandler = handleCompareTypeChange;
        
        // Initialize with current operator and compare type
        this.handleOperatorChange(operator);
        this.handleCompareTypeChange(state.compareType || 'value');
        
        // Store the state being edited
        this.editingState = state;
        
        // Render the state effects form (this will populate existing effects)
        this.renderStateChangesList();
        
        this.showModal('stateModal');
    }

    deleteVariable(variableId) {
        if (confirm('Are you sure you want to delete this variable?')) {
            this.globalVariables = this.globalVariables.filter(v => v.id !== variableId);
            this.renderVariables();
            this.selectedItem = null;
            this.updatePropertiesPanel();
            this.logDebug(`Deleted variable: ${variableId}`, 'warning');
        }
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.renderEvents();
            this.selectedItem = null;
            this.updatePropertiesPanel();
            this.logDebug(`Deleted event: ${eventId}`, 'warning');
        }
    }

    deleteState(stateId) {
        if (confirm('Are you sure you want to delete this state?')) {
            this.states = this.states.filter(s => s.id !== stateId);
            this.renderStates();
            this.selectedItem = null;
            this.updatePropertiesPanel();
            this.logDebug(`Deleted state: ${stateId}`, 'warning');
        }
    }

    addElement(elementType) {
        const icons = {
            'Chart': '📊',
            'KPI': '📈',
            'Filter': '🔽',
            'Table': '📋',
            'Button': '🔘'
        };
        
        const element = {
            id: `element_${Date.now()}`,
            name: `New ${elementType}`,
            type: elementType,
            icon: icons[elementType] || '📊',
            properties: this.getDefaultPropertiesForType(elementType),
            events: [],
            states: []
        };
        
        this.visualElements.push(element);
        this.renderElements();
        this.logDebug(`Added new element: ${element.name}`, 'success');
    }

    getDefaultPropertiesForType(type) {
        const defaults = {
            'Chart': {
                title: 'New Chart',
                chart_type: 'bar',
                data_source: 'default'
            },
            'KPI': {
                value: '0',
                trend: '0%',
                color: 'blue'
            },
            'Filter': {
                options: ['Option 1', 'Option 2'],
                multi_select: false
            },
            'Table': {
                data_source: 'default',
                columns: ['Column 1', 'Column 2'],
                page_size: 10
            },
            'Button': {
                text: 'Click Me',
                color: 'primary',
                size: 'medium'
            }
        };
        return defaults[type] || {};
    }

    deleteElement(elementId) {
        if (confirm('Are you sure you want to delete this element?')) {
            this.visualElements = this.visualElements.filter(e => e.id !== elementId);
            this.renderElements();
            this.selectedItem = null;
            this.updatePropertiesPanel();
            this.logDebug(`Deleted element: ${elementId}`, 'warning');
        }
    }

    addEvent() {
        this.showEventModal();
    }

    addState() {
        this.showStateModal();
    }

    clearWorkspace() {
        if (confirm('Are you sure you want to clear the workspace? This will remove all visual elements.')) {
            this.visualElements = [];
            this.connections = [];
            this.renderElements();
            this.selectedItem = null;
            this.updatePropertiesPanel();
            this.logDebug('Workspace cleared', 'warning');
        }
    }

    filterVariables(searchTerm) {
        const variableItems = document.querySelectorAll('.variable-item');
        
        variableItems.forEach(item => {
            const variableName = item.querySelector('.variable-name').textContent.toLowerCase();
            const isVisible = variableName.includes(searchTerm.toLowerCase());
            item.style.display = isVisible ? 'block' : 'none';
        });
    }

    toggleTestMode() {
        this.isTestMode = !this.isTestMode;
        
        if (this.isTestMode) {
            this.showTestModal();
            this.logDebug('Entered test mode', 'info');
        } else {
            this.hideModal('testModal');
            this.logDebug('Exited test mode', 'info');
        }
    }

    showTestModal() {
        this.renderTestButtons();
        this.renderVariablesMonitor();
        this.showModal('testModal');
    }

    renderTestButtons() {
        const testButtons = document.getElementById('testButtons');
        testButtons.innerHTML = '';
        
        // Add variable update buttons first
        this.globalVariables.forEach(variable => {
            if (variable.type === 'Boolean') {
                const button = document.createElement('button');
                button.className = 'btn btn--outline btn--sm';
                button.textContent = `Toggle: ${variable.name}`;
                button.addEventListener('click', () => this.toggleVariable(variable.id));
                testButtons.appendChild(button);
            }
        });
        
        // Group events by category
        const eventsByCategory = {
            'General': [],
            'Filter': [],
            'Bookmark': [],
            'Navigation': []
        };
        
        this.events.forEach(event => {
            const category = event.category || 'General';
            if (eventsByCategory[category]) {
                eventsByCategory[category].push(event);
            } else {
                eventsByCategory['General'].push(event);
            }
        });
        
        // Add event test buttons by category
        Object.entries(eventsByCategory).forEach(([category, events]) => {
            if (events.length > 0) {
                // Add category header
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'test-category-header';
                categoryHeader.innerHTML = `${this.getEventCategoryIcon(category)} <strong>${category} Events</strong>`;
                testButtons.appendChild(categoryHeader);
                
                // Add event buttons
                events.forEach(event => {
                    const button = document.createElement('button');
                    button.className = 'btn btn--secondary btn--sm';
                    button.textContent = `Trigger: ${event.name}`;
                    button.addEventListener('click', () => this.simulateEvent(event));
                    testButtons.appendChild(button);
                });
            }
        });
    }

    renderVariablesMonitor() {
        const monitor = document.getElementById('variablesMonitor');
        monitor.innerHTML = '';
        
        this.globalVariables.forEach(variable => {
            const monitorItem = document.createElement('div');
            monitorItem.className = 'monitor-variable';
            monitorItem.innerHTML = `
                <span class="monitor-name">${variable.name}</span>
                <span class="monitor-value" data-variable="${variable.id}">${this.formatValue(variable.current_value)}</span>
            `;
            monitor.appendChild(monitorItem);
        });
    }

    simulateEvent(event) {
        this.logDebug(`Simulating event: ${event.name}`, 'info');
        
        // Simulate the event action
        if (event.action === 'update_global_variable' || event.action === 'update_variable') {
            const variable = this.globalVariables.find(v => v.id === event.target);
            if (variable) {
                // Use the specified value if provided, otherwise simulate a value change
                let newValue;
                if (event.action === 'update_variable' && event.parameters && event.parameters.value) {
                    newValue = event.parameters.value;
                } else if (event.category === 'Filter') {
                    if (event.target === 'active_filters') {
                        newValue = JSON.stringify({"region_filter": "Europe", "date_range": "2024-09-01"});
                    } else {
                        newValue = this.getSimulatedValueForType(variable.type);
                    }
                } else if (event.category === 'Navigation') {
                    if (event.target === 'current_page') {
                        newValue = event.parameters?.value || 'dashboard';
                        // Update navigation history
                        const historyVar = this.globalVariables.find(v => v.id === 'navigation_history');
                        if (historyVar) {
                            const history = JSON.parse(historyVar.current_value || '[]');
                            if (event.parameters?.update_history) {
                                history.push(newValue);
                                this.updateVariableValue('navigation_history', JSON.stringify(history));
                            }
                        }
                    } else if (event.target === 'selected_tab') {
                        newValue = event.parameters?.value || 'elements';
                    } else {
                        newValue = this.getSimulatedValueForType(variable.type);
                    }
                } else if (event.category === 'Bookmark') {
                    if (event.target === 'current_bookmark') {
                        newValue = event.parameters?.bookmark_id || 'user_view_1';
                    } else {
                        newValue = this.getSimulatedValueForType(variable.type);
                    }
                } else {
                    newValue = this.getSimulatedValueForType(variable.type);
                }
                
                this.updateVariableValue(variable.id, newValue);
                this.logDebug(`Variable ${variable.name} updated to: ${newValue}`, 'success');
            }
        } else if (event.action === 'toggle_variable') {
            this.toggleVariable(event.target);
        } else if (event.action === 'save_bookmark_config') {
            // Simulate saving a bookmark
            const bookmarkConfigs = this.globalVariables.find(v => v.id === 'bookmark_configs');
            if (bookmarkConfigs) {
                const configs = JSON.parse(bookmarkConfigs.current_value || '[]');
                const newBookmark = {
                    id: `bookmark_${Date.now()}`,
                    name: event.parameters?.config_name || 'New Bookmark',
                    filters: JSON.parse(this.globalVariables.find(v => v.id === 'active_filters')?.current_value || '{}'),
                    timestamp: new Date().toISOString()
                };
                configs.push(newBookmark);
                this.updateVariableValue('bookmark_configs', JSON.stringify(configs));
                this.logDebug(`Bookmark saved: ${newBookmark.name}`, 'success');
            }
        } else if (event.action === 'load_bookmark_config') {
            // Simulate loading a bookmark
            const bookmarkId = event.parameters?.bookmark_id || 'default_view';
            this.updateVariableValue('current_bookmark', bookmarkId);
            this.logDebug(`Bookmark loaded: ${bookmarkId}`, 'success');
        } else if (event.action === 'delete_bookmark_config') {
            // Simulate deleting a bookmark
            const bookmarkConfigs = this.globalVariables.find(v => v.id === 'bookmark_configs');
            if (bookmarkConfigs) {
                const configs = JSON.parse(bookmarkConfigs.current_value || '[]');
                const filteredConfigs = configs.filter(b => b.id !== event.parameters?.bookmark_id);
                this.updateVariableValue('bookmark_configs', JSON.stringify(filteredConfigs));
                this.logDebug(`Bookmark deleted: ${event.parameters?.bookmark_id}`, 'warning');
            }
        }
    }

    getSimulatedValueForType(type) {
        switch (type) {
            case 'String':
                const options = ['North America', 'Europe', 'Asia Pacific', 'All'];
                return options[Math.floor(Math.random() * options.length)];
            case 'Boolean':
                return Math.random() > 0.5;
            case 'Number':
                return Math.floor(Math.random() * 1000);
            case 'Array':
                return JSON.stringify(['Item 1', 'Item 2', 'Item 3']);
            case 'Object':
                return JSON.stringify({key: 'value', count: Math.floor(Math.random() * 10)});
            default:
                return 'Updated Value';
        }
    }

    updateVariableValue(variableId, newValue) {
        const variable = this.globalVariables.find(v => v.id === variableId);
        if (variable) {
            // Track previous value for onChange detection
            const previousValue = variable.current_value;
            const hasChanged = previousValue !== newValue;
            
            // Update current value
            variable.current_value = newValue;
            
            // Mark variable as changed if value actually changed
            if (hasChanged) {
                this.changedVariables.add(variableId);
            }
            
            // Update the monitor display
            const monitorValue = document.querySelector(`[data-variable="${variableId}"]`);
            if (monitorValue) {
                monitorValue.textContent = this.formatValue(newValue);
            }
            
            // Update the variables list
            this.renderVariables();
            
            // Update properties panel if this variable is selected
            if (this.selectedItem && this.selectedItem.type === 'variable' && this.selectedItem.data.id === variableId) {
                this.selectedItem.data = variable;
                this.updatePropertiesPanel();
            }
            
            // Check and trigger state changes
            this.evaluateStates();
            
            // Clear the changed flag after evaluation
            this.changedVariables.delete(variableId);
        }
    }

    toggleVariable(variableId) {
        const variable = this.globalVariables.find(v => v.id === variableId);
        if (variable && variable.type === 'Boolean') {
            this.updateVariableValue(variableId, !variable.current_value);
        }
    }

    evaluateStates() {
        this.states.forEach(state => {
            const isActive = this.evaluateCondition(state.condition);
            
            if (isActive) {
                this.logDebug(`State activated: ${state.name}`, 'success');
                // Apply state effects to elements
                state.effects.forEach(effect => {
                    const element = this.visualElements.find(e => e.id === effect.element);
                    if (element) {
                        this.logDebug(`Applying state effects to element: ${element.name}`, 'info');
                    }
                });
            }
        });
    }

    evaluateCondition(condition) {
        // Parse condition: "variable_id operator [compare_value]"
        const parts = condition.split(' ');
        if (parts.length < 2) {
            return false;
        }
        
        const variableId = parts[0];
        const operator = parts[1];
        
        // Find the variable
        const variable = this.globalVariables.find(v => v.id === variableId);
        if (!variable) {
            return false;
        }
        
        // Handle onChange operator
        if (operator === 'onChange') {
            // Return true if this variable was just changed
            return this.changedVariables.has(variableId);
        }
        
        // For other operators, need comparison value
        if (parts.length < 3) {
            return false;
        }
        
        const compareValue = parts.slice(2).join(' ');
        const currentValue = variable.current_value;
        let finalCompareValue = compareValue;
        
        // Check if compareValue is actually a variable ID
        const compareVariable = this.globalVariables.find(v => v.id === compareValue);
        if (compareVariable) {
            // It's comparing against another variable
            finalCompareValue = compareVariable.current_value;
        }
        
        // Convert string values to appropriate types for comparison
        if (variable.type === 'Number') {
            finalCompareValue = parseFloat(finalCompareValue);
            return this.compareValues(currentValue, finalCompareValue, operator);
        } else if (variable.type === 'Boolean') {
            finalCompareValue = String(finalCompareValue).toLowerCase() === 'true';
            return this.compareValues(currentValue, finalCompareValue, operator);
        } else {
            // String comparison
            return this.compareValues(String(currentValue), String(finalCompareValue), operator);
        }
    }
    
    compareValues(left, right, operator) {
        switch (operator) {
            case '==':
                return left == right;
            case '!=':
                return left != right;
            case '>':
                return left > right;
            case '<':
                return left < right;
            case '>=':
                return left >= right;
            case '<=':
                return left <= right;
            case 'contains':
                return String(left).toLowerCase().includes(String(right).toLowerCase());
            default:
                return false;
        }
    }

    saveConfiguration() {
        const config = {
            variables: this.globalVariables,
            elements: this.visualElements,
            events: this.events,
            states: this.states,
            connections: this.connections,
            timestamp: new Date().toISOString()
        };
        
        // In a real application, this would save to a backend
        console.log('Configuration saved:', config);
        
        // Create download link for demo
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bi-configuration.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logDebug('Configuration exported successfully', 'success');
    }

    clearDebug() {
        const debugConsole = document.getElementById('debugConsole');
        debugConsole.innerHTML = '';
        this.logDebug('Debug console cleared', 'info');
    }

    logDebug(message, type = 'info') {
        // Log to browser console since debug panel was removed
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        switch(type) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warning':
                console.warn(logMessage);
                break;
            case 'success':
                console.log(`✓ ${logMessage}`);
                break;
            default:
                console.log(logMessage);
        }
    }
}

// Initialize the application when the DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BIConfigBuilder();
});
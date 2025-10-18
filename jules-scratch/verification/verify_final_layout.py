from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    file_path = os.path.abspath('index.html')
    page.goto(f'file://{file_path}')

    os.makedirs('jules-scratch/verification', exist_ok=True)

    # 1. Initial view (Variables tab active)
    page.screenshot(path='jules-scratch/verification/01_final_initial_view.png')

    # 2. Select the first variable and check properties panel
    page.locator('.variable-item[data-variable-id="region_filter"]').click()
    page.screenshot(path='jules-scratch/verification/02_final_variable_selected.png')

    # 3. Switch to Properties tab to ensure it shows the same content
    page.locator('.sidebar-tab-btn[data-panel="properties"]').click()
    page.screenshot(path='jules-scratch/verification/03_final_properties_tab.png')

    # 4. Switch to Events tab
    page.locator('.sidebar-tab-btn[data-panel="events"]').click()
    page.screenshot(path='jules-scratch/verification/04_final_events_tab.png')

    # 5. Select the first event and check properties panel
    page.locator('.event-item[data-event-id="evt_1"]').click()
    page.locator('.sidebar-tab-btn[data-panel="properties"]').click() # Switch to properties to see
    page.screenshot(path='jules-scratch/verification/05_final_event_selected.png')

    # 6. Switch to States tab
    page.locator('.sidebar-tab-btn[data-panel="states"]').click()
    page.screenshot(path='jules-scratch/verification/06_final_states_tab.png')

    # 7. Test the "Add Variable" modal
    page.locator('.sidebar-tab-btn[data-panel="variables"]').click()
    page.locator('#addVariableBtn').click()
    page.wait_for_selector('#variableModal.active')
    page.screenshot(path='jules-scratch/verification/07_final_add_variable_modal.png')
    page.locator('#closeVariableModal').click()

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

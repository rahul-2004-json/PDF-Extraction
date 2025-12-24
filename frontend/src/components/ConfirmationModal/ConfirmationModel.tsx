import type { OrderFormData } from "../../models/orderFormModel"
import './ConfirmationModel.css';

interface ConfirmationModalProps {
    orderData: OrderFormData;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({ orderData, onConfirm, onCancel }: ConfirmationModalProps) {
    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return String(value);
    };

    const formatAddress = (contact: any): string => {
        if (!contact || typeof contact !== 'object') {
            return 'N/A';
        }
        const parts: string[] = [];
        if (contact.address_line_1) parts.push(contact.address_line_1);
        if (contact.address_line_2) parts.push(contact.address_line_2);
        if (contact.city) parts.push(contact.city);
        if (contact.state) parts.push(contact.state);
        if (contact.postal_code) parts.push(contact.postal_code);
        if (contact.country) parts.push(contact.country);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const hasData = (): boolean => {
        return !!(
            orderData?.client ||
            (orderData?.contacts && orderData.contacts.length > 0) ||
            orderData?.billing_terms ||
            orderData?.client_selected_plan ||
            (orderData?.plan_catalog && orderData.plan_catalog.length > 0) ||
            (orderData?.add_on_modules && orderData.add_on_modules.length > 0) ||
            orderData?.bank_account ||
            orderData?.additional_notes
        );
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Confirm Submission</h2>
                    <button type="button" className="close-btn" onClick={onCancel} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <p className="confirmation-message">Please review all the data before confirming submission:</p>

                    {hasData() && (
                        <div className="data-preview">
                            {/* Client Information */}
                            {orderData.client && (
                                <div className="preview-section">
                                    <h3>Client Information</h3>
                                    {orderData.client.dsp_name && (
                                        <div className="preview-grid">
                                            <div className="preview-item">
                                                <span className="preview-label">DSP Name</span>
                                                <span className="preview-value">{formatValue(orderData.client.dsp_name)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">DSP Code</span>
                                                <span className="preview-value">{formatValue(orderData.client.dsp_code)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">DSP FEIN</span>
                                                <span className="preview-value">{formatValue(orderData.client.dsp_fein)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            )}
                            {/*Contacts*/}
                            {orderData.contacts && orderData.contacts.length > 0 && (
                                <div className="preview-section">
                                    <h3>Contacts</h3>
                                    {(() => {
                                        const dspContact = orderData.contacts.find(c => 
                                            c.contact_type?.toLowerCase().includes('dsp')
                                        );
                                        const apContact = orderData.contacts.find(c => 
                                            c.contact_type?.toLowerCase().includes('accounts payable') || 
                                            c.contact_type?.toLowerCase().includes('accounts pay')
                                        );

                                        return (
                                            <div className="contacts-preview-table-container">
                                                <table className="contacts-preview-table">
                                                    <thead>
                                                        <tr>
                                                            <th>DSP Contact</th>
                                                            <th>Accounts Payable Contact</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="contact-preview-cell">
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Name</span>
                                                                        <span className="preview-value">{formatValue(dspContact?.name)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Email</span>
                                                                        <span className="preview-value">{formatValue(dspContact?.email)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Phone</span>
                                                                        <span className="preview-value">{formatValue(dspContact?.phone)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Address</span>
                                                                        <span className="preview-value">{formatAddress(dspContact)}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="contact-preview-cell">
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Name</span>
                                                                        <span className="preview-value">{formatValue(apContact?.name)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Email</span>
                                                                        <span className="preview-value">{formatValue(apContact?.email)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Phone</span>
                                                                        <span className="preview-value">{formatValue(apContact?.phone)}</span>
                                                                    </div>
                                                                    <div className="preview-item">
                                                                        <span className="preview-label">Address</span>
                                                                        <span className="preview-value">{formatAddress(apContact)}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            {/*Billing Terms*/}
                            {orderData.billing_terms && (
                                <div className="preview-section">
                                    <h3>Billing Terms</h3>
                                    {orderData.billing_terms && (
                                        <div className="preview-grid">
                                            <div className="preview-item">
                                                <span className="preview-label">Initial Term Period</span>
                                                <span className="preview-value">{formatValue(orderData.billing_terms.initial_term_period)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">Renewal Term Period</span>
                                                <span className="preview-value">{formatValue(orderData.billing_terms.renewal_term_period)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">Billing Frequency</span>
                                                <span className="preview-value">{formatValue(orderData.billing_terms.billing_frequency)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">Initial Term Start Date</span>
                                                <span className="preview-value">{formatValue(orderData.billing_terms.initial_term_start_date)}</span>
                                            </div>
                                            <div className="preview-item">
                                                <span className="preview-label">Initial Term End Date</span>
                                                <span className="preview-value">{formatValue(orderData.billing_terms.initial_term_end_date)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            )}
                            {/*Client Subscription*/}
                            {(orderData.client_selected_plan || (orderData.plan_catalog && orderData.plan_catalog.length > 0)) && (
                                <div className="preview-section">
                                    <h3>Client Subscription</h3>
                                    {orderData.client_selected_plan && Object.keys(orderData.client_selected_plan).length > 0 && (
                                        <>
                                            <h4>Selected Plan</h4>
                                            <div className="preview-grid">
                                                <div className="preview-item">
                                                    <span className="preview-label">Employee Range</span>
                                                    <span className="preview-value">{formatValue(orderData.client_selected_plan.selected_employee_range)}</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Payroll Frequency</span>
                                                    <span className="preview-value">{formatValue(orderData.client_selected_plan.payroll_frequency)}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {orderData.plan_catalog && orderData.plan_catalog.length > 0 && (
                                        <>
                                            <br />
                                            <h4>Plan Catalog</h4>
                                            <div className="plan-catalog-preview">
                                                <table className="plan-catalog-preview-table">
                                                    <thead>
                                                        <tr className="plan-catalog-preview-table-header-row">
                                                            <th>Employee Range</th>
                                                            <th colSpan={2}>Weekly</th>
                                                            <th colSpan={2}>Biweekly</th>
                                                            <th>Implementation Fee</th>
                                                        </tr>
                                                        <tr className="plan-catalog-preview-table-subheader-row">
                                                            <th></th>
                                                            <th>Base Fee</th>
                                                            <th>Per Check Fee</th>
                                                            <th>Base Fee</th>
                                                            <th>Per Check Fee</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderData.plan_catalog.map((plan, i) => {
                                                            return (
                                                                <tr key={i} className="plan-catalog-preview-table-data-row">
                                                                    <td>{formatValue(plan.employee_range_label)}</td>
                                                                    <td>${formatValue(plan.weekly_base_fee)}</td>
                                                                    <td>${formatValue(plan.weekly_per_check)}</td>
                                                                    <td>${formatValue(plan.biweekly_base_fee)}</td>
                                                                    <td>${formatValue(plan.biweekly_per_check)}</td>
                                                                    <td>${formatValue(plan.one_time_implementation_fee)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {/* Client Modules */}
                            {
                                orderData.add_on_modules && orderData.add_on_modules.length > 0 && (
                                    <div className="preview-section">
                                        <h3>Client Modules ({orderData.add_on_modules.length})</h3>
                                        <div className="modules-preview-container">
                                            <table className="modules-preview-table">
                                                <thead>
                                                    <tr className="modules-preview-table-header-row">
                                                        <th>Module Name</th>
                                                        <th>Fee/Unit</th>
                                                        <th>Unit Type</th>
                                                        <th>Units</th>
                                                        <th>Subscription Fee</th>
                                                        <th>Frequency</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderData.add_on_modules.map((module, i) => {
                                                        return (
                                                            <tr key={i} className="modules-preview-table-data-row">
                                                                <td>{formatValue(module.module_name)}</td>
                                                                <td>${formatValue(module.fee_per_unit)}</td>
                                                                <td>{formatValue(module.unit_type)}</td>
                                                                <td>{formatValue(module.units)}</td>
                                                                <td>{formatValue(module.subscription_fee)}</td>
                                                                <td>{formatValue(module.subscription_fee_frequency)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {orderData.billing_terms && (
                                            <div className="preview-grid" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                                <div className="preview-item">
                                                    <span className="preview-label">Estimate Employee Count:</span>
                                                    <span className="preview-value">{formatValue(orderData.billing_terms.estimated_employee_count)}</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Total Subscription Fee:</span>
                                                    <span className="preview-value">${formatValue(orderData.billing_terms.estimated_total_subscription_fee)}</span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Setup Fee:</span>
                                                    <span className="preview-value">${formatValue(orderData.billing_terms.one_time_setup_fee)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            {/* Bank Account */}
                            {orderData.bank_account && (
                                <div className="preview-section">
                                    <h3>Bank Account</h3>
                                    <div className="preview-grid">
                                        <div className="preview-item">
                                            <span className="preview-label">Bank Name</span>
                                            <span className="preview-value">{formatValue(orderData.bank_account.bank_name)}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Routing Number</span>
                                            <span className="preview-value">{formatValue(orderData.bank_account.routing_number)}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Account Number</span>
                                            <span className="preview-value">{formatValue(orderData.bank_account.account_number)}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Account Type</span>
                                            <span className="preview-value">{formatValue(orderData.bank_account.account_type)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Notes */}
                            {orderData.additional_notes && (
                                <div className="preview-section">
                                    <h3>Additional Notes</h3>
                                    <div className="preview-item-group">
                                        <div className="preview-item additional-notes-preview">
                                            <span className="preview-value additional-notes-text">{formatValue(orderData.additional_notes)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div >
                    )}



                    {
                        !hasData() && (
                            <div className="no-data">
                                <p>No data to display.</p>
                            </div>
                        )
                    }
                </div >

                <div className="modal-footer">
                    <button type="button" className="btn-review" onClick={onCancel}>
                        Review Again
                    </button>
                    <button type="button" className="btn-confirm" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div >
        </div >
    );
}
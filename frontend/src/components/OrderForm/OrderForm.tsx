import { useState, useEffect } from 'react';
import type { OrderFormData } from '../../models/orderFormModel';
import './OrderForm.css';
import { FaTrashAlt } from "react-icons/fa";

interface OrderFormProps {
    orderData?: OrderFormData;
    onSubmit: (data: OrderFormData) => void;
    onDataChange: (data: OrderFormData) => void;
    onStartNew: () => void;
}

export default function OrderForm({ orderData, onSubmit, onDataChange, onStartNew }: OrderFormProps) {
    const [formData, setFormData] = useState<OrderFormData>({
        client: {},
        contacts: [],
        billing_terms: {},
        client_selected_plan: {},
        plan_catalog: [],
        add_on_modules: [],
        bank_account: {},
        additional_notes: '',
    });

    useEffect(() => {
        if (orderData) {
            const cloned = JSON.parse(JSON.stringify(orderData));
            if (!cloned.client) cloned.client = {};
            if (!cloned.contacts) cloned.contacts = [];
            if (!cloned.billing_terms) cloned.billing_terms = {};
            if (!cloned.client_selected_plan) cloned.client_selected_plan = {};
            if (!cloned.plan_catalog) cloned.plan_catalog = [];
            if (!cloned.add_on_modules) cloned.add_on_modules = [];
            if (!cloned.bank_account) cloned.bank_account = {};
            if (!cloned.additional_notes) cloned.additional_notes = '';
            setFormData(cloned);
        }
    }, [orderData]);

    useEffect(() => {
        if (onDataChange) {
            const timeoutId = setTimeout(() => {
                onDataChange(formData);
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [formData, onDataChange]);

    const updateFormData = (updater: (prev: OrderFormData) => OrderFormData) => {
        setFormData(prev => {
            const newData = updater(prev);
            if (onDataChange) {
                onDataChange(newData);
            }
            return newData;
        });
    };



    const addContact = () => {
        updateFormData(prev => ({
            ...prev,
            contacts: [...(prev.contacts || []), {}],
        }));
    };

    const removeContact = (index: number) => {
        updateFormData(prev => {
            const contacts = [...(prev.contacts || [])];
            contacts.splice(index, 1);
            return { ...prev, contacts };
        });
    };

    const addClientModule = () => {
        updateFormData(prev => ({
            ...prev,
            add_on_modules: [...(prev.add_on_modules || []), {}],
        }));
    };

    const removeClientModule = (index: number) => {
        updateFormData(prev => {
            const modules = [...(prev.add_on_modules || [])];
            modules.splice(index, 1);
            return { ...prev, add_on_modules: modules };
        });
    };

    const addPlan = () => {
        updateFormData(prev => ({
            ...prev,
            plan_catalog: [...(prev.plan_catalog || []), {
                employee_range_label: '',
                employee_range_min: 0,
                employee_range_max: 0,
                one_time_implementation_fee: 0,
                weekly_base_fee: 0,
                weekly_per_check: 0,
                biweekly_base_fee: 0,
                biweekly_per_check: 0
            }],
        }));
    };

    const removePlan = (index: number) => {
        updateFormData(prev => {
            const plans = [...(prev.plan_catalog || [])];
            plans.splice(index, 1);
            return { ...prev, plan_catalog: plans };
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const startNewSubmission = () => {
        if (onStartNew) {
            onStartNew();
        }
        else {
            window.location.reload();
        }
    };

    const isSmallDSPName = () => {
        const name = formData.client?.dsp_name;
        return !!(name && name.length <= 24);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>Review and Edit Order Form Data</h2>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
                {/* Client Information Section */}
                <section className="form-section">
                    <h3 className="section-title">Client Information</h3>
                    <div className={`form-grid ${isSmallDSPName() ? 'client-info-grid' : ''}`}>
                        <div className="form-group">
                            <label htmlFor="dsp-name">DSP Name</label>
                            <input
                                type="text"
                                id="dsp-name"
                                value={formData.client?.dsp_name || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    client: { ...prev.client, dsp_name: e.target.value },
                                }))}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dsp-code">DSP Code</label>
                            <input
                                type="text"
                                id="dsp-code"
                                value={formData.client?.dsp_code || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    client: { ...prev.client, dsp_code: e.target.value },
                                }))}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dsp-fein">DSP FEIN</label>
                            <input
                                type="text"
                                id="dsp-fein"
                                value={formData.client?.dsp_fein || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    client: { ...prev.client, dsp_fein: e.target.value },
                                }))}
                                className="form-input"
                            />
                        </div>
                    </div>
                </section>

                {/* Contacts Section */}
                <section className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">Contacts</h3>
                        {/* <button type="button" className="btn-add" onClick={addContact}>
                            + Add Contact
                        </button> */}
                    </div>

                    {/* Helper function to get contact by type */}
                    {(() => {
                        const dspContact = formData.contacts?.find(c =>
                            c.contact_type?.toLowerCase().includes('dsp')
                        );
                        const apContact = formData.contacts?.find(c =>
                            c.contact_type?.toLowerCase().includes('accounts payable') ||
                            c.contact_type?.toLowerCase().includes('accounts pay')
                        );
                        const otherContacts = formData.contacts?.filter(c =>
                            c !== dspContact && c !== apContact
                        ) || [];

                        return (
                            <>
                                <div className="contacts-table-container">
                                    <table className="contacts-table">
                                        <thead>
                                            <tr>
                                                <th>DSP Contact</th>
                                                <th>Accounts Payable Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div className="contact-cell">
                                                        <div className="form-group">
                                                            <label>Name</label>
                                                            <input
                                                                type="text"
                                                                value={dspContact?.name || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === dspContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], name: e.target.value };
                                                                    } else {
                                                                        contacts.push({ contact_type: 'DSP', name: e.target.value });
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter name"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email</label>
                                                            <input
                                                                type="email"
                                                                value={dspContact?.email || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === dspContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], email: e.target.value };
                                                                    } else {
                                                                        const newContact = { contact_type: 'DSP', email: e.target.value };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter email"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input
                                                                type="tel"
                                                                value={dspContact?.phone || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === dspContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], phone: e.target.value };
                                                                    } else {
                                                                        const newContact = { contact_type: 'DSP', phone: e.target.value };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter phone"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Address Line 1</label>
                                                            <input
                                                                type="text"
                                                                value={dspContact?.address_line_1 || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === dspContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { 
                                                                            ...contacts[index], 
                                                                            address_line_1: e.target.value
                                                                        };
                                                                    } else {
                                                                        const newContact = { 
                                                                            contact_type: 'DSP', 
                                                                            address_line_1: e.target.value
                                                                        };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter address line 1"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Address Line 2</label>
                                                            <input
                                                                type="text"
                                                                value={dspContact?.address_line_2 || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === dspContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { 
                                                                            ...contacts[index], 
                                                                            address_line_2: e.target.value
                                                                        };
                                                                    } else {
                                                                        const newContact = { 
                                                                            contact_type: 'DSP', 
                                                                            address_line_2: e.target.value
                                                                        };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter address line 2"
                                                            />
                                                        </div>
                                                        <div className="address-row">
                                                            <div className="form-group">
                                                                <label>City</label>
                                                                <input
                                                                    type="text"
                                                                    value={dspContact?.city || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === dspContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                city: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'DSP', 
                                                                                city: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter city"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>State</label>
                                                                <input
                                                                    type="text"
                                                                    value={dspContact?.state || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === dspContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                state: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'DSP', 
                                                                                state: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter state"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="address-row">
                                                            <div className="form-group">
                                                                <label>Postal Code</label>
                                                                <input
                                                                    type="text"
                                                                    value={dspContact?.postal_code || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === dspContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                postal_code: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'DSP', 
                                                                                postal_code: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter postal code"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Country</label>
                                                                <input
                                                                    type="text"
                                                                    value={dspContact?.country || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === dspContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                country: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'DSP', 
                                                                                country: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter country code (e.g., USA)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-cell">
                                                        <div className="form-group">
                                                            <label>Name</label>
                                                            <input
                                                                type="text"
                                                                value={apContact?.name || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === apContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], name: e.target.value };
                                                                    } else {
                                                                        contacts.push({ contact_type: 'Accounts Payable', name: e.target.value });
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter name"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Email</label>
                                                            <input
                                                                type="email"
                                                                value={apContact?.email || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === apContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], email: e.target.value };
                                                                    } else {
                                                                        const newContact = { contact_type: 'Accounts Payable', email: e.target.value };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter email"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input
                                                                type="tel"
                                                                value={apContact?.phone || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === apContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { ...contacts[index], phone: e.target.value };
                                                                    } else {
                                                                        const newContact = { contact_type: 'Accounts Payable', phone: e.target.value };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter phone"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Address Line 1</label>
                                                            <input
                                                                type="text"
                                                                value={apContact?.address_line_1 || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === apContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { 
                                                                            ...contacts[index], 
                                                                            address_line_1: e.target.value
                                                                        };
                                                                    } else {
                                                                        const newContact = { 
                                                                            contact_type: 'Accounts Payable', 
                                                                            address_line_1: e.target.value
                                                                        };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter address line 1"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Address Line 2</label>
                                                            <input
                                                                type="text"
                                                                value={apContact?.address_line_2 || ''}
                                                                onChange={(e) => {
                                                                    const contacts = [...(formData.contacts || [])];
                                                                    const index = contacts.findIndex(c => c === apContact);
                                                                    if (index >= 0) {
                                                                        contacts[index] = { 
                                                                            ...contacts[index], 
                                                                            address_line_2: e.target.value
                                                                        };
                                                                    } else {
                                                                        const newContact = { 
                                                                            contact_type: 'Accounts Payable', 
                                                                            address_line_2: e.target.value
                                                                        };
                                                                        contacts.push(newContact);
                                                                    }
                                                                    updateFormData(prev => ({ ...prev, contacts }));
                                                                }}
                                                                className="form-input contact-input"
                                                                placeholder="Enter address line 2"
                                                            />
                                                        </div>
                                                        <div className="address-row">
                                                            <div className="form-group">
                                                                <label>City</label>
                                                                <input
                                                                    type="text"
                                                                    value={apContact?.city || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === apContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                city: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'Accounts Payable', 
                                                                                city: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter city"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>State</label>
                                                                <input
                                                                    type="text"
                                                                    value={apContact?.state || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === apContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                state: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'Accounts Payable', 
                                                                                state: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter state"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="address-row">
                                                            <div className="form-group">
                                                                <label>Postal Code</label>
                                                                <input
                                                                    type="text"
                                                                    value={apContact?.postal_code || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === apContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                postal_code: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'Accounts Payable', 
                                                                                postal_code: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter postal code"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Country</label>
                                                                <input
                                                                    type="text"
                                                                    value={apContact?.country || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        const index = contacts.findIndex(c => c === apContact);
                                                                        if (index >= 0) {
                                                                            contacts[index] = { 
                                                                                ...contacts[index], 
                                                                                country: e.target.value
                                                                            };
                                                                        } else {
                                                                            const newContact = { 
                                                                                contact_type: 'Accounts Payable', 
                                                                                country: e.target.value
                                                                            };
                                                                            contacts.push(newContact);
                                                                        }
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input contact-input"
                                                                    placeholder="Enter country code (e.g., USA)"
                                                                />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Show other contacts if any */}
                                {otherContacts.length > 0 && (
                                    <div className="other-contacts-section">
                                        <h4>Additional Contacts</h4>
                                        <div className="contacts-list">
                                            {otherContacts.map((contact) => {
                                                const originalIndex = formData.contacts?.indexOf(contact) ?? -1;
                                                return (
                                                    <div key={originalIndex} className="contact-item">
                                                        <div className="item-header">
                                                            <h4>{contact.contact_type || 'Contact'}</h4>
                                                            <button type="button" className="btn-remove" onClick={() => removeContact(originalIndex)}>
                                                                <FaTrashAlt size={15} />
                                                            </button>
                                                        </div>
                                                        <div className="contact-grid">
                                                            <div className="contact-row">
                                                                <div className="form-group">
                                                                    <label>Contact Type</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.contact_type || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { ...contacts[originalIndex], contact_type: e.target.value };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                        placeholder="e.g., DSP, Accounts Payable"
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.name || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { ...contacts[originalIndex], name: e.target.value };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="contact-row">
                                                                <div className="form-group">
                                                                    <label>Email</label>
                                                                    <input
                                                                        type="email"
                                                                        value={contact.email || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { ...contacts[originalIndex], email: e.target.value };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Phone</label>
                                                                    <input
                                                                        type="tel"
                                                                        value={contact.phone || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { ...contacts[originalIndex], phone: e.target.value };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-group contact-full">
                                                                <label>Address Line 1</label>
                                                                <input
                                                                    type="text"
                                                                    value={contact.address_line_1 || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        contacts[originalIndex] = { 
                                                                            ...contacts[originalIndex], 
                                                                            address_line_1: e.target.value
                                                                        };
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input"
                                                                    placeholder="Enter address line 1"
                                                                />
                                                            </div>
                                                            <div className="form-group contact-full">
                                                                <label>Address Line 2</label>
                                                                <input
                                                                    type="text"
                                                                    value={contact.address_line_2 || ''}
                                                                    onChange={(e) => {
                                                                        const contacts = [...(formData.contacts || [])];
                                                                        contacts[originalIndex] = { 
                                                                            ...contacts[originalIndex], 
                                                                            address_line_2: e.target.value
                                                                        };
                                                                        updateFormData(prev => ({ ...prev, contacts }));
                                                                    }}
                                                                    className="form-input"
                                                                    placeholder="Enter address line 2"
                                                                />
                                                            </div>
                                                            <div className="address-row">
                                                                <div className="form-group contact-full">
                                                                    <label>City</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.city || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { 
                                                                                ...contacts[originalIndex], 
                                                                                city: e.target.value
                                                                            };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                        placeholder="Enter city"
                                                                    />
                                                                </div>
                                                                <div className="form-group contact-full">
                                                                    <label>State</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.state || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { 
                                                                                ...contacts[originalIndex], 
                                                                                state: e.target.value
                                                                            };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                        placeholder="Enter state"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="address-row">
                                                                <div className="form-group contact-full">
                                                                    <label>Postal Code</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.postal_code || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { 
                                                                                ...contacts[originalIndex], 
                                                                                postal_code: e.target.value
                                                                            };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                        placeholder="Enter postal code"
                                                                    />
                                                                </div>
                                                                <div className="form-group contact-full">
                                                                    <label>Country</label>
                                                                    <input
                                                                        type="text"
                                                                        value={contact.country || ''}
                                                                        onChange={(e) => {
                                                                            const contacts = [...(formData.contacts || [])];
                                                                            contacts[originalIndex] = { 
                                                                                ...contacts[originalIndex], 
                                                                                country: e.target.value
                                                                            };
                                                                            updateFormData(prev => ({ ...prev, contacts }));
                                                                        }}
                                                                        className="form-input"
                                                                        placeholder="Enter country code (e.g., USA)"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {(!formData.contacts || formData.contacts.length === 0) && (
                                    <p className="empty-message">
                                        No contacts added. Click "Add Contact" to add one.
                                    </p>
                                )}
                            </>
                        );
                    })()}
                </section>

                {/* Billing Terms Section*/}
                <section className='form-section'>
                    <h3 className="section-title">Billing Terms</h3>
                    {formData.billing_terms && Object.keys(formData.billing_terms).length > 0 && (
                        <div className="billing-terms-grid">
                            <div className="form-group">
                                <label htmlFor="initial-term-period">Initial Term Period</label>
                                <input
                                    type="text"
                                    id="initial-term-period"
                                    value={formData.billing_terms?.initial_term_period || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        billing_terms: { ...prev.billing_terms, initial_term_period: e.target.value },
                                    }))}
                                    name="initial-term-period"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="renewal-term-period">Renewal Term Period</label>
                                <input
                                    type="text"
                                    id="renewal-term-period"
                                    value={formData.billing_terms?.renewal_term_period || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        billing_terms: { ...prev.billing_terms, renewal_term_period: e.target.value },
                                    }))}
                                    name="renewal-term-period"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="billing-frequency">Billing Frequency</label>
                                <input
                                    type="text"
                                    id="billing-frequency"
                                    value={formData.billing_terms?.billing_frequency || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        billing_terms: { ...prev.billing_terms, billing_frequency: e.target.value },
                                    }))}
                                    name="billing-frequency"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="initial-term-start">Initial Term Start Date</label>
                                <input
                                    type="date"
                                    id="initial-term-start"
                                    value={formData.billing_terms?.initial_term_start_date?.toString() || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        billing_terms: { ...prev.billing_terms, initial_term_start_date: e.target.value },
                                    }))}
                                    name="initial-term-start"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="initial-term-end">Initial Term End Date</label>
                                <input
                                    type="date"
                                    id="initial-term-end"
                                    value={formData.billing_terms?.initial_term_end_date?.toString() || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        billing_terms: { ...prev.billing_terms, initial_term_end_date: e.target.value },
                                    }))}
                                    name="initial-term-end"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* Client Subscription Section */}
                <section className="form-section">
                    <h3 className="section-title">Client Subscription</h3>
                    <h4>Selected Plan</h4>
                    <br />
                    {formData.client_selected_plan && Object.keys(formData.client_selected_plan).length > 0 && (
                        <div className="client-subscription-grid">
                            <div className="form-group">
                                <label htmlFor="employee-range">Employee Range</label>
                                <input
                                    type="text"
                                    id="employee-range"
                                    value={formData.client_selected_plan?.selected_employee_range || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        client_selected_plan: { ...prev.client_selected_plan, selected_employee_range: e.target.value }
                                    }))}
                                    name="employee-range"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="payroll-frequency">Payroll Frequency</label>
                                <select
                                    id="payroll-frequency"
                                    value={formData.client_selected_plan?.payroll_frequency || ''}
                                    onChange={(e) => updateFormData(prev => ({
                                        ...prev,
                                        client_selected_plan: { ...prev.client_selected_plan, payroll_frequency: e.target.value as 'Weekly' | 'Bi-Weekly' }
                                    }))}
                                    name="payroll-frequency"
                                    className="form-input"
                                >
                                    <option value="Weekly">Weekly</option>
                                    <option value="Bi-Weekly">Bi-Weekly</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <br />
                    <div className="section-header">
                        <h4>Plan Catalog</h4>
                        <button type="button" className="btn-add" onClick={() => addPlan()}>+ Add Plan</button>
                    </div>
                    {formData.plan_catalog && formData.plan_catalog.length > 0 ? (
                        <div className="plan-catalog-container">
                            <table className="plan-catalog-table">
                                <thead>
                                    <tr className="plan-catalog-table-header-row">
                                        <th>Employee Range</th>
                                        <th colSpan={2}>Weekly</th>
                                        <th colSpan={2}>Biweekly</th>
                                        <th>Implementation Fee</th>
                                        <th></th>
                                    </tr>
                                    <tr className="plan-catalog-table-subheader-row">
                                        <th></th>
                                        <th>Base Fee</th>
                                        <th>Per Check Fee</th>
                                        <th>Base Fee</th>
                                        <th>Per Check Fee</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.plan_catalog.map((plan, i) => {
                                        return (
                                            <tr key={i} className="plan-catalog-table-data-row">
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            id={`employee-range-${i}`}
                                                            value={plan?.employee_range_label || ''}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, employee_range_label: e.target.value } : p) || [],
                                                            }))}
                                                            name={`employee-range-${i}`}
                                                            className="form-input plan-catalog-employee-range-input"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            id={`weekly-base-fee-${i}`}
                                                            value={plan?.weekly_base_fee ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, weekly_base_fee: parseFloat(e.target.value) } : p) || [],
                                                            }))}
                                                            name={`weekly-base-fee-${i}`}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            id={`weekly-per-check-${i}`}
                                                            value={plan?.weekly_per_check ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, weekly_per_check: parseFloat(e.target.value) } : p) || [],
                                                            }))}
                                                            name={`weekly-per-check-${i}`}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            id={`biweekly-base-fee-${i}`}
                                                            value={plan?.biweekly_base_fee ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, biweekly_base_fee: parseFloat(e.target.value) } : p) || [],
                                                            }))}
                                                            name={`biweekly-base-fee-${i}`}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            id={`biweekly-per-check-${i}`}
                                                            value={plan?.biweekly_per_check ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, biweekly_per_check: parseFloat(e.target.value) } : p) || [],
                                                            }))}
                                                            name={`biweekly-per-check-${i}`}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            id={`implementation-fee-${i}`}
                                                            value={plan?.one_time_implementation_fee ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                plan_catalog: prev.plan_catalog?.map((p, index) => index === i ? { ...p, one_time_implementation_fee: parseFloat(e.target.value) } : p) || [],
                                                            }))}
                                                            name={`implementation-fee-${i}`}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-remove plan-remove-btn"
                                                        onClick={() => removePlan(i)}
                                                        title="Remove Plan"
                                                    >
                                                        <FaTrashAlt size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="empty-message">
                            No plans added. Click "Add Plan" to add one.
                        </p>
                    )}
                </section>

                {/*Additional Modules Section*/}
                <section className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">Add-On Modules</h3>
                        <button type="button" className="btn-add" onClick={() => addClientModule()}>+ Add Module</button>
                    </div>

                    {formData.add_on_modules && formData.add_on_modules.length > 0 ? (
                        <div className="modules-table-container">
                            <table className="modules-table">
                                <thead>
                                    <tr className="modules-table-header-row">
                                        <th>Module Name</th>
                                        <th>Fee/Unit</th>
                                        <th>Unit Type</th>
                                        <th>Units</th>
                                        <th>Subscription Fee</th>
                                        <th>Frequency</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.add_on_modules.map((module, i) => {
                                        return (
                                            <tr key={i} className="modules-table-data-row">
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            value={module.module_name || ''}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, module_name: e.target.value } : m) || [],
                                                            }))}
                                                            name={'module-name-' + i}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            value={module.fee_per_unit ?? 0}
                                                            name={'fee-per-unit-' + i}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, fee_per_unit: parseFloat(e.target.value) } : m) || [],
                                                            }))}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <select
                                                            value={module.unit_type || ''}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, unit_type: e.target.value as 'Per Employee Per Payroll' | 'Per Employee Per Year' | 'Per EIN Per Month' | 'Per Garnishment Per Payroll' } : m) || [],
                                                            }))}
                                                            name={'unit-type-' + i}
                                                            className="form-input"
                                                        >
                                                            <option value="">Select...</option>
                                                            <option value="Per Employee Per Payroll">Per Employee Per Payroll</option>
                                                            <option value="Per Employee Per Year">Per Employee Per Year</option>
                                                            <option value="Per EIN Per Month">Per EIN Per Month</option>
                                                            <option value="Per Garnishment Per Payroll">Per Garnishment Per Payroll</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            value={module.units ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, units: parseInt(e.target.value) } : m) || [],
                                                            }))}
                                                            name={'units-' + i}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            value={module.subscription_fee ?? 0}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, subscription_fee: parseFloat(e.target.value) } : m) || [],
                                                            }))}
                                                            name={'subscription-fee-' + i}
                                                            className="form-input"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="form-group">
                                                        <select
                                                            value={module.subscription_fee_frequency || ''}
                                                            onChange={(e) => updateFormData(prev => ({
                                                                ...prev,
                                                                add_on_modules: prev.add_on_modules?.map((m, index) => index === i ? { ...m, subscription_fee_frequency: e.target.value as 'Monthly' | 'Yearly' } : m) || [],
                                                            }))}
                                                            name={'subscription-fee-frequency-' + i}
                                                            className="form-input"
                                                        >
                                                            <option value="">Select...</option>
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-remove module-remove-btn"
                                                        onClick={() => removeClientModule(i)}
                                                        title="Remove Module"
                                                    >
                                                        <FaTrashAlt size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="empty-message">
                            No modules added. Click "Add Module" to add one.
                        </p>
                    )}
                    <br />
                    <hr />
                    <br />
                    {/* <!-- Additional Information Section --> */}
                    <div className="modules-footer">
                        <div className="form-group">
                            <label htmlFor="employee-count">Employee Count</label>
                            <input
                                id="employee-count"
                                type="number"
                                className="form-input"
                                value={formData.billing_terms?.estimated_employee_count ?? 0}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    billing_terms: { ...prev.billing_terms, estimated_employee_count: parseInt(e.target.value) },
                                }))}
                                name="employee-count"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="total-subscription-fee">Total Subscription Fee</label>
                            <input
                                id="total-subscription-fee"
                                type="number"
                                step="0.01"
                                className="form-input"
                                value={formData.billing_terms?.estimated_total_subscription_fee ?? 0}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    billing_terms: { ...prev.billing_terms, estimated_total_subscription_fee: parseFloat(e.target.value) },
                                }))}
                                name="total-subscription-fee"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="setup-fee">One Time Setup Fee</label>
                            <input
                                id="setup-fee"
                                type="number"
                                step="0.01"
                                className="form-input"
                                value={formData.billing_terms?.one_time_setup_fee ?? 0}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    billing_terms: { ...prev.billing_terms, one_time_setup_fee: parseFloat(e.target.value) },
                                }))}
                                name="setup-fee"
                            />
                        </div>
                    </div>


                    {formData.add_on_modules && formData.add_on_modules.length === 0 && (
                        <p className="empty-message">
                            No modules added. Click "Add Module" to add one.
                        </p>
                    )}
                </section >

                {/* Bank Accounts Section */}
                <section className="form-section">
                    <h3 className="section-title">Bank Account</h3>
                    <div className="bank-account-row">
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                id="bank-name"
                                value={formData.bank_account?.bank_name || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    bank_account: { ...prev.bank_account, bank_name: e.target.value }
                                }))}
                                name="bank-name"
                                className="form-input"
                                placeholder="Enter bank name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Routing Number</label>
                            <input
                                type="text"
                                id="routing-number"
                                value={formData.bank_account?.routing_number || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    bank_account: { ...prev.bank_account, routing_number: e.target.value }
                                }))}
                                name="routing-number"
                                className="form-input"
                                placeholder="Enter routing number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                id="account-number"
                                value={formData.bank_account?.account_number || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    bank_account: { ...prev.bank_account, account_number: e.target.value }
                                }))}
                                name="account-number"
                                className="form-input"
                                placeholder="Enter account number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Account Type</label>
                            <select
                                id="account-type"
                                value={formData.bank_account?.account_type || ''}
                                onChange={(e) => updateFormData(prev => ({
                                    ...prev,
                                    bank_account: { ...prev.bank_account, account_type: e.target.value as 'Checking' | 'Savings' }
                                }))}
                                name="account-type"
                                className="form-input"
                            >
                                <option value="">Select...</option>
                                <option value="Checking">Checking</option>
                                <option value="Savings">Savings</option>
                            </select>
                        </div>
                    </div>
                </section >

                {/* Additional Notes Section */}
                <section className="form-section">
                    <h3 className="section-title">Additional Notes</h3>
                    <div className="form-group additional-notes-group">
                        <textarea
                            id="additional-notes"
                            value={formData.additional_notes || ''}
                            onChange={(e) => updateFormData(prev => ({
                                ...prev,
                                additional_notes: e.target.value,
                            }))}
                            name="additional-notes"
                            className="form-textarea"
                            placeholder="Enter any additional notes or instructions here..."
                            rows={8}
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => startNewSubmission()}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit">Submit Order Form</button>
                </div>
            </form >
        </div >
    );
}
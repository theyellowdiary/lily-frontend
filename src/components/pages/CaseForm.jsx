import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withFormik } from 'formik';
import { withNamespaces } from 'react-i18next';
import { format } from 'date-fns';
import Select from 'react-select';
import AsyncSelect from 'react-select/lib/Async';

import withContext from 'src/withContext';
import { SELECT_STYLES, FORM_DATE_FORMAT } from 'lib/constants';
import { successToast, errorToast } from 'utils/toasts';
import addBusinessDays from 'utils/addBusinessDays';
import BlockUI from 'components/Utils/BlockUI';
import FormSection from 'components/Utils/FormSection';
import FormFooter from 'components/Utils/FormFooter';
import LilyDatepicker from 'components/Utils/LilyDatePicker';
import LoadingIndicator from 'components/Utils/LoadingIndicator';
import TagField from 'components/Fields/TagField';
import Account from 'models/Account';
import Contact from 'models/Contact';
import User from 'models/User';
import UserTeam from 'models/UserTeam';
import Case from 'models/Case';

class InnerCaseForm extends Component {
  constructor(props) {
    super(props);

    this.originalDate = props.values.id ? new Date(props.values.expires) : new Date();

    this.state = {
      caseTypes: [],
      caseStatuses: [],
      casePriorities: [],
      caseSuggestions: [],
      showSuggestions: true,
      loading: true
    };
  }

  async componentDidMount() {
    const { currentUser, data } = this.props;
    const typeData = await Case.caseTypes();
    const statusData = await Case.statuses();
    const priorityData = await Case.priorities();

    this.setState({
      caseTypes: typeData.results,
      caseStatuses: statusData.results,
      casePriorities: priorityData.results
    });

    const { id } = this.props.match.params;

    if (id) {
      await this.loadCase(id);

      document.title = `${this.props.values.subject} - Lily`;
    } else {
      this.props.setFieldValue('assignedToTeams', currentUser.teams);
      this.props.setFieldValue('assignedTo', currentUser);
      this.props.setFieldValue('status', statusData.results[0]);

      if (data.account) {
        this.props.setFieldValue('account', data.account);
      }

      if (this.props.data) {
        Object.keys(this.props.data).forEach(key => {
          this.props.setFieldValue(key, this.props.data[key]);
        });
      }

      document.title = 'Add case - Lily';
    }

    this.setState({ loading: false });
  }

  loadCase = async id => {
    const caseResponse = await Case.get(id);

    if (caseResponse.account && caseResponse.account.isDeleted) {
      caseResponse.account = null;
    }

    if (caseResponse.contact && caseResponse.contact.isDeleted) {
      caseResponse.contact = null;
    }

    this.props.setValues(caseResponse);
  };

  editCase = async id => {
    await this.loadCase(id);

    this.props.history.push(`/cases/${id}/edit`);

    // Clear the suggestions.
    this.setState({ caseSuggestions: [] });
  };

  searchName = async () => {
    const { contactSuggestions, showSuggestions } = this.state;
    const { subject } = this.props.values;

    if (!this.props.values.id && subject) {
      const filterquery = `subject:${subject}`;
      // TODO: Change this to new way of searching.
      const response = await Case.search(filterquery);

      if (response.hits.length > 0) {
        contactSuggestions.name = response.hits;
      }

      showSuggestions.name = true;

      this.setState({ contactSuggestions, showSuggestions });
    }
  };

  searchAccounts = async query => {
    // TODO: This needs to have search query and sorting implemented.
    // Search the given model with the search query and any specific sorting.
    const request = await Account.query({ query });

    return request.results;
  };

  searchContacts = async query => {
    // TODO: This needs to have search query and sorting implemented.
    // Search the given model with the search query and any specific sorting.
    const request = await Contact.query({ query });

    return request.results;
  };

  searchTeams = async query => {
    // TODO: This needs to have search query and sorting implemented.
    // Search the given model with the search query and any specific sorting.
    const request = await UserTeam.query({ query });

    return request.results;
  };

  searchUsers = async query => {
    // TODO: This needs to have search query and sorting implemented.
    // Search the given model with the search query and any specific sorting.
    const request = await User.query({ query });

    return request.results;
  };

  handlePriority = priority => {
    const newDate = addBusinessDays(priority.dateIncrement, this.originalDate);
    const formattedDate = format(newDate, FORM_DATE_FORMAT);

    this.props.setFieldValue('expires', formattedDate);
    this.props.setFieldValue('priority', priority.id);
  };

  handleRelated = (type, items) => {
    this.props.setFieldValue(type, items);
  };

  handleClose = field => {
    const { showSuggestions } = this.state;
    showSuggestions[field] = false;

    this.setState({ showSuggestions });
  };

  handleAccount = async value => {
    this.props.setFieldValue('account', value);

    const args = {
      account: value.id
    };

    if (value.contacts.length === 1) {
      this.props.setFieldValue('contact', value.contacts[0]);

      args.contact = value.contacts[0].id;
    }

    const caseResponse = await Case.openCases(args);

    this.setState({ caseSuggestions: caseResponse.results, showSuggestions: true });
  };

  handleContact = value => {
    this.props.setFieldValue('contact', value);
  };

  render() {
    const {
      caseTypes,
      caseStatuses,
      casePriorities,
      loading,
      caseSuggestions,
      showSuggestions
    } = this.state;
    const { values, errors, isSubmitting, handleChange, handleSubmit, t } = this.props;

    return (
      <React.Fragment>
        {!loading ? (
          <BlockUI blocking={isSubmitting}>
            <div className="content-block-container">
              <div className="content-block">
                <div className="content-block-header">
                  <div className="content-block-name">
                    {values.id ? (
                      <React.Fragment>Edit case</React.Fragment>
                    ) : (
                      <React.Fragment>Add case</React.Fragment>
                    )}
                  </div>
                </div>

                <div className="content-block-content">
                  <form onSubmit={handleSubmit}>
                    <FormSection header="Who was it?">
                      <div className={`form-field${errors.account ? ' has-error' : ''}`}>
                        <label htmlFor="account">Account</label>
                        <AsyncSelect
                          defaultOptions
                          name="account"
                          value={values.account}
                          styles={SELECT_STYLES}
                          onChange={this.handleAccount}
                          loadOptions={this.searchAccounts}
                          getOptionLabel={option => option.name}
                          getOptionValue={option => option.name}
                          placeholder="Select an account"
                        />

                        {errors.account && <div className="error-message">{errors.account}</div>}
                      </div>

                      <div className={`form-field${errors.contact ? ' has-error' : ''}`}>
                        <label htmlFor="contact">Contact</label>
                        <AsyncSelect
                          defaultOptions
                          name="contact"
                          value={values.contact}
                          styles={SELECT_STYLES}
                          onChange={this.handleContact}
                          loadOptions={this.searchContacts}
                          getOptionLabel={option => option.fullName}
                          getOptionValue={option => option.fullName}
                          placeholder="Select a contact"
                        />

                        {errors.contact && <div className="error-message">{errors.contact}</div>}
                      </div>

                      <React.Fragment>
                        {caseSuggestions.length > 0 && showSuggestions ? (
                          <div className="form-suggestions">
                            <div className="form-suggestion-title">
                              <div>{t('forms:case.openCase')}</div>

                              <button
                                className="hl-interface-btn"
                                onClick={this.handleClose}
                                type="button"
                              >
                                <i className="lilicon hl-close-icon" />
                              </button>
                            </div>

                            <div className="form-suggestion-items">
                              {caseSuggestions.map(suggestion => {
                                const navLink = (
                                  <Link to={`/cases/${suggestion.id}`}>{suggestion.subject}</Link>
                                );

                                return (
                                  <div className="form-suggestion-row" key={suggestion.id}>
                                    <div className="form-suggestion-info">
                                      Check it out: {navLink}
                                    </div>

                                    <div className="form-suggestion-action">
                                      <button
                                        className="hl-primary-btn"
                                        onClick={() => this.editCase(suggestion.id)}
                                        type="button"
                                      >
                                        Edit case
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </React.Fragment>
                    </FormSection>

                    <FormSection header="What to do?">
                      <div className={`form-field${errors.subject ? ' has-error' : ''}`}>
                        <label htmlFor="subject" required>
                          Subject
                        </label>
                        <input
                          id="subject"
                          type="text"
                          className="hl-input"
                          placeholder="Subject"
                          value={values.subject}
                          onChange={handleChange}
                          onBlur={this.searchName}
                        />

                        {errors.subject && <div className="error-message">{errors.subject}</div>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          placeholder="Description"
                          rows="3"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </div>

                      <div className={`form-field${errors.type ? ' has-error' : ''}`}>
                        <label htmlFor="type" required>
                          Type
                        </label>
                        <Select
                          name="type"
                          value={values.type}
                          styles={SELECT_STYLES}
                          onChange={value => this.props.setFieldValue('type', value)}
                          options={caseTypes}
                          getOptionLabel={option => option.name}
                          getOptionValue={option => option.name}
                          placeholder="Select a type"
                        />

                        {errors.type && <div className="error-message">{errors.type}</div>}
                      </div>

                      <div className={`form-field${errors.status ? ' has-error' : ''}`}>
                        <label htmlFor="status" required>
                          Status
                        </label>
                        <Select
                          name="status"
                          classNamePrefix="editable-input"
                          value={values.status}
                          styles={SELECT_STYLES}
                          onChange={value => this.props.setFieldValue('status', value)}
                          options={caseStatuses}
                          getOptionLabel={option => option.name}
                          getOptionValue={option => option.name}
                        />

                        {errors.status && <div className="error-message">{errors.status}</div>}
                      </div>
                    </FormSection>

                    <FormSection header="When to do it?">
                      <div className="form-field">
                        <label htmlFor="priority" required>
                          Priority
                        </label>

                        <div className="case-priority-buttons">
                          {casePriorities.map(priority => {
                            let dateIncrementText = '';

                            if (priority.dateIncrement > 1) {
                              dateIncrementText = `(in ${priority.dateIncrement} days)`;
                            } else if (priority.dateIncrement === 1) {
                              dateIncrementText = '(tomorrow)';
                            } else {
                              dateIncrementText = '(today)';
                            }

                            const isSelected = values.priority === priority.id;

                            return (
                              <button
                                key={priority.id}
                                type="button"
                                className={`hl-primary-btn ${priority.name.toLowerCase()}-priority`}
                                onClick={() => this.handlePriority(priority)}
                              >
                                <label
                                  className={`radio-button${
                                    isSelected ? ' active' : ''
                                  } m-l-5 display-inline-block`}
                                >
                                  <input
                                    readOnly
                                    type="radio"
                                    id={`priority-${priority.id}`}
                                    className="radio-button-input"
                                    checked={isSelected}
                                  />

                                  <span className="radio-button-label">
                                    {isSelected && <span className="radio-button-checkmark" />}

                                    {priority.name}
                                  </span>
                                </label>
                                <span className="text-muted small"> {dateIncrementText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`form-field${errors.expires ? ' has-error' : ''}`}>
                        <label htmlFor="expires" required>
                          Expiry date
                        </label>
                        <LilyDatepicker
                          date={values.expires}
                          onChange={value => this.props.setFieldValue('expires', value)}
                          placeholder="Expiry date"
                        />

                        {errors.expires && <div className="error-message">{errors.expires}</div>}
                      </div>
                    </FormSection>

                    <FormSection header="Who is going to do this?">
                      <div className={`form-field${errors.assignedToTeams ? ' has-error' : ''}`}>
                        <label htmlFor="assignedToTeams">Assigned to teams</label>
                        <AsyncSelect
                          isMulti
                          defaultOptions
                          name="assignedToTeams"
                          value={values.assignedToTeams}
                          styles={SELECT_STYLES}
                          onChange={value => this.props.setFieldValue('assignedToTeams', value)}
                          loadOptions={this.searchTeams}
                          getOptionLabel={option => option.name}
                          getOptionValue={option => option.name}
                        />

                        {errors.assignedToTeams && (
                          <div className="error-message">{errors.assignedToTeams}</div>
                        )}
                      </div>

                      <div className={`form-field${errors.assignedTo ? ' has-error' : ''}`}>
                        <label htmlFor="assignedTo">Assigned to</label>
                        <AsyncSelect
                          defaultOptions
                          name="assignedTo"
                          classNamePrefix="editable-input"
                          value={values.assignedTo}
                          styles={SELECT_STYLES}
                          onChange={value => this.props.setFieldValue('assignedTo', value)}
                          loadOptions={this.searchUsers}
                          getOptionLabel={option => option.fullName}
                          getOptionValue={option => option.fullName}
                        />

                        {errors.assignedTo && (
                          <div className="error-message">{errors.assignedTo}</div>
                        )}
                      </div>
                    </FormSection>

                    <FormSection header="Tags">
                      <div className="form-field">
                        <label>Tags</label>
                        <TagField items={values.tags} handleRelated={this.handleRelated} />
                      </div>
                    </FormSection>

                    <FormFooter {...this.props} />
                  </form>
                </div>
              </div>
            </div>
          </BlockUI>
        ) : (
          <LoadingIndicator />
        )}
      </React.Fragment>
    );
  }
}

const CaseForm = withRouter(
  withFormik({
    mapPropsToValues: () => ({
      account: null,
      contact: null,
      subject: '',
      description: '',
      type: null,
      status: null,
      priority: 0,
      expires: format(new Date(), FORM_DATE_FORMAT),
      tags: []
    }),
    handleSubmit: (values, { props, setSubmitting, setErrors }) => {
      const { t } = props;
      const cleanedValues = Object.assign({}, values);

      if (cleanedValues.account) cleanedValues.account = cleanedValues.account.id;
      if (cleanedValues.contact) cleanedValues.contact = cleanedValues.contact.id;
      if (cleanedValues.type) cleanedValues.type = cleanedValues.type.id;
      if (cleanedValues.status) cleanedValues.status = cleanedValues.status.id;
      if (cleanedValues.assignedTo) cleanedValues.assignedTo = cleanedValues.assignedTo.id;
      if (cleanedValues.assignedToTeams) {
        cleanedValues.assignedToTeams = cleanedValues.assignedToTeams.map(team => team.id);
      }

      cleanedValues.expires = format(cleanedValues.expires, 'yyyy-MM-dd');

      let request;
      let text;

      if (values.id) {
        request = Case.patch(cleanedValues);
        text = t('toasts:modelUpdated', { model: 'case' });
      } else {
        request = Case.post(cleanedValues);
        text = t('toasts:modelCreated', { model: 'case' });
      }

      request
        .then(response => {
          if (props.closeSidebar) {
            props.closeSidebar();
          }

          successToast(text);

          props.history.push(`/cases/${response.id}`);
        })
        .catch(errors => {
          errorToast(t('toasts:error'));
          setErrors(errors.data);
          setSubmitting(false);
        });
    },
    displayName: 'CaseForm'
  })(InnerCaseForm)
);

export default withNamespaces(['forms', 'toasts'])(withContext(CaseForm));

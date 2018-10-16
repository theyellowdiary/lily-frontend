import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Editable from 'components/Editable';
import ContentBlock from 'components/ContentBlock';
import LilyDate from 'components/Utils/LilyDate';
import ClientDisplay from 'components/Utils/ClientDisplay';
import ListFilter from 'components/List/ListFilter';
import UserTeam from 'models/UserTeam';
import Settings from 'models/Settings';
import Case from 'models/Case';

class UnassignedCases extends Component {
  constructor(props) {
    super(props);

    this.settings = new Settings('unassignedCases');

    this.state = {
      items: [],
      caseTypes: [],
      teams: [],
      filters: { list: [] }
    };
  }

  componentDidMount = async () => {
    const settingsResponse = await this.settings.get();
    const caseTypeResponse = await Case.caseTypes();
    const caseTypes = caseTypeResponse.results.map(caseType => {
      caseType.value = `type.id: ${caseType.id}`;

      return caseType;
    });
    const teamResponse = await UserTeam.query();
    const teams = teamResponse.results.map(team => {
      team.value = `assignedToTeams.id:${team.id}`;

      return team;
    });

    await this.loadItems();

    this.setState({
      ...settingsResponse.results,
      caseTypes,
      teams
    });
  };

  loadItems = async () => {
    const request = await Case.query();
    const total = request.results.length;
    const criticalCount = request.results.filter(item => item.priority === Case.CRITICAL_PRIORITY)
      .length;
    const items = request.results;

    this.setState({ items, total, criticalCount });
  };

  setFilters = async filters => {
    await this.settings.store({ filters });

    this.setState({ filters }, this.loadItems);
  };

  render() {
    const { items, caseTypes, teams, filters, total, criticalCount } = this.state;

    const title = (
      <React.Fragment>
        <div className="content-block-label cases" />
        <div className="content-block-name">
          <i className="lilicon hl-case-icon m-r-5" />
          Unassigned cases
          <span className="label-amount">{total || '-'}</span>
          <span className="label-amount high-prio">{criticalCount || '-'}</span>
        </div>
      </React.Fragment>
    );

    const extra = (
      <React.Fragment>
        <ListFilter
          label="Case types"
          items={caseTypes}
          filters={filters}
          setFilters={this.setFilters}
        />

        <ListFilter label="Teams" items={teams} filters={filters} setFilters={this.setFilters} />
      </React.Fragment>
    );

    return (
      <ContentBlock title={title} extra={extra} component="unassignedCases" expandable closeable>
        <table className="hl-table">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Subject</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Teams</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <Link to={`/cases/${item.id}`}>{item.subject}</Link>
                </td>
                <td>
                  <ClientDisplay contact={item.contact} account={item.account} />
                </td>
                <td>
                  <Editable
                    type="select"
                    object={item}
                    field="priority"
                    submitCallback={this.submitCallback}
                    icon
                    hideValue
                  />
                </td>
                <td>
                  {item.assignedToTeams.map(team => (
                    <div key={team.id}>{team.name}</div>
                  ))}
                </td>
                <td>
                  <LilyDate date={item.created} />
                </td>
                <td>
                  <button className="hl-primary-btn">Assign to me</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ContentBlock>
    );
  }
}

export default UnassignedCases;

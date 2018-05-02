import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import Deal from 'models/Deal';
import Widget from 'components/Widget';
import LilyDate from 'components/utils/LilyDate';
import timeCategorize from 'utils/timeCategorize';

class MyDeals extends Component {
  constructor(props) {
    super(props);

    this.state = { items: [] };
  }

  componentDidMount = async () => {
    await this.getItems();
  }

  getItems = async () => {
    const request = await Deal.query();

    const total = request.results.length;
    const items = timeCategorize(request.results, 'expires', { id: 22 });

    this.setState({ items, total });
  }

  render() {
    const { items, total } = this.state;

    const title = (
      <React.Fragment>
        <div className="widget-label deals" />
        <div className="widget-name">
          <i className="lilicon hl-deals-icon m-r-5" />
          My deals
          <span className="label-amount">{total || '-'}</span>
        </div>
      </React.Fragment>
    );

    const categories = [];

    Object.keys(items).forEach(key => {
      const newlyAssigned = key === 'newlyAssigned';

      const tbody = (
        <tbody key={key}>
          {items[key].length > 0 &&
            <tr className="table-category">
              {newlyAssigned ?
                (
                  <td colSpan="8">Newly assigned to you</td>
                ) :
                (
                  <td colSpan="8" className="text-capitalize">{key}</td>
                )
              }
            </tr>
          }
          {items[key].map(item =>
            (
              <tr key={item.id} className={newlyAssigned ? 'newly-assigned' : ''}>
                <td><NavLink to={`/deals/${item.id}`}>{item.name}</NavLink></td>
                <td>
                  {item.contact &&
                    <NavLink to={`/contacts/${item.contact.id}`}>{item.contact.fullName}</NavLink>
                  }
                  {(item.contact && item.account) && <span> at </span>}
                  {item.account &&
                    <NavLink to={`/accounts/${item.account.id}`}>{item.account.name}</NavLink>
                  }
                </td>
                <td>
                  {item.amountOnce !== 0 && <span>{item.amountOnce} /month</span>}
                  {(item.amountOnce !== 0 && item.amountRecurring !== 0) && <span> | </span>}
                  {item.amountRecurring !== 0 && <span>{item.amountRecurring} /once</span>}
                </td>
                <td>{item.status.name}</td>
                <td>{item.nextStep.name}</td>
                <td><LilyDate date={item.nextStepDate} /></td>
                <td>
                  {newlyAssigned &&
                    <button className="hl-primary-btn round">
                      <FontAwesomeIcon icon="check" />
                    </button>
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      );

      categories.push(tbody);
    });

    return (
      <Widget title={title} component="myDeals" expandable>
        <table className="hl-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Client</th>
              <th>Deal size</th>
              <th>Status</th>
              <th>Next step</th>
              <th>Next step date</th>
              <th>Actions</th>
            </tr>
          </thead>

          {categories}
        </table>
      </Widget>
    );
  }
}

export default MyDeals;

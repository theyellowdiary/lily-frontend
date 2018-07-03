import { get, post, patch, del, createParams } from 'src/lib/api';

class Account {
  get(id) {
    return get(`/accounts/${id}/`);
  }

  post(data) {
    return post('/accounts/', data);
  }

  patch(data) {
    return patch(`/accounts/${data.id}/`, data);
  }

  del(id) {
    return del(`/accounts/${id}/`);
  }

  query(params) {
    const response = get(`/accounts/?${createParams(params)}`);

    return response;
  }

  statuses() {
    const response = get('/accounts/statuses/');

    return response;
  }

  getDataproviderInfo(url) {
    const response = post('/provide/dataprovider/', { url });

    return response;
  }

  searchByEmailAddress(emailAddress) {
    const response = get(`/search/emailaddress/${emailAddress}`);

    return response;
  }

  searchByPhoneNumber(phoneNumber) {
    const response = get(`/search/number/${phoneNumber}`);

    return response;
  }

  searchByWebsite(website) {
    const response = get(`/search/website/${website}`);

    return response;
  }

  // TODO: Temporary code. Actual search will be different.
  search(filterquery) {
    const url = `/search/search/?type=accounts_account&filterquery=${filterquery}`;

    const response = get(url);

    return response;
  }
}

export default new Account();

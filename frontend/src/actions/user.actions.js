import { useSetRecoilState, useRecoilState, useResetRecoilState  } from 'recoil';

import { history, useAxiosWrapper } from '../helpers'
import { authAtom, usersAtom, userAtom } from '../state';

export { useUserActions };

function useUserActions () {
  const urlPartUsers = "/users";
  const urlPartLogIn = "/login";
  const urlPartSignUp = "/signup";
  const [auth, setAuth] = useRecoilState(authAtom);
  const setUsers = useSetRecoilState(usersAtom);
  const setUser = useSetRecoilState(userAtom);
  const forecastApi = useAxiosWrapper().forecastApi;


  return {
    login,
    logout,
    signup,
    getAll,
    getById,
    update,
    create,
    delete: _delete,
    resetUsers: useResetRecoilState(usersAtom),
    resetUser: useResetRecoilState(userAtom)
  }

  function handleLoginResponse(auth) {
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem('user', JSON.stringify(auth));
    setAuth(auth);

    // get return url from location state or default to home page
    const { from } = history.location.state || { from: { pathname: '/' } };
    history.navigate(from);
  }

  async function login(email, password) {
    const bodyFormData = new FormData();
    bodyFormData.append('username', email);
    bodyFormData.append('password', password);

    const response = await forecastApi.post(urlPartLogIn, bodyFormData);
    const auth = response?.data;
    if (auth) {
      handleLoginResponse(auth)
    }
  }

  function logout() {
    // remove user from local storage, set auth state to null and redirect to login page
    localStorage.removeItem('user');
    setAuth(null);
    history.navigate('/login');
  }

  async function signup(user) {
    const response = await forecastApi.post(urlPartSignUp, {
      full_name: user.fullName,
      email: user.email,
      password: user.password
    });
    const auth = response.data;
    if (auth) {
      handleLoginResponse(auth)
    }
  }

  function getAll() {
    return forecastApi.get(urlPartUsers).then(response => response.data).then(setUsers);
  }

  function getById(id) {
    return forecastApi.get(`${urlPartUsers}/${id}`).then(setUser);
  }

  function create(user) {
    return forecastApi.post(urlPartUsers, {
      full_name: user.fullName,
      email: user.email,
      password: user.password
    });
  }

  function update(id, params) {
    return forecastApi.patch(`${urlPartUsers}/${id}`, params)
      .then(x => {
        // update stored user if the logged in user updated their own record
        if (id === auth?.user?.id) {
          // update local storage
          const user = { ...auth, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // update auth user in recoil state
          setAuth(user);
        }
        return x;
      });
  }

  // prefixed with underscored because delete is a reserved word in javascript
  function _delete(id) {
    setUsers(users => users.map(x => {
      // add isDeleting prop to user being deleted
      if (x.id === id)
        return { ...x, isDeleting: true };

      return x;
    }));

    return forecastApi.delete(`${urlPartUsers}/${id}`)
      .then(() => {
        // remove user from list after deleting
        setUsers(users => users.filter(x => x.id !== id));

        // auto logout if the logged in user deleted their own record
        if (id === auth?.user?.id) {
          logout();
        }
      });
  }
}

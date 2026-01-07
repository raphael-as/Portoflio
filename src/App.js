import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { ThemeContext } from './contexts/ThemeContext';
import { Main } from './pages';
import { BackToTop, CursorFollow } from './components';
import ScrollToTop from './utils/ScrollToTop';

import './App.css';

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.classList.add('app-loaded');
  }, []);

  return (
    <div className={`app ${theme}`}>
      <Router>
        <CursorFollow />
        <ScrollToTop />

        <Switch>
          <Route path="/" exact component={Main} />
          <Redirect to="/" />
        </Switch>
      </Router>

      <BackToTop />
    </div>
  );
}

export default App;

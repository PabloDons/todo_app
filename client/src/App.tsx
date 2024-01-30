import React, { useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid'
import './App.css';
import API from './api';
import { Main } from './components/Main';


function App() {
  const [api, setApi] = useState<API>();

  useEffect(() => {
    API.createAPI().then(api => {
      setApi(api)
    })
  }, [])

  return api ? (<Main api={api}></Main>) : (<div>loading</div>)
}

export default App;
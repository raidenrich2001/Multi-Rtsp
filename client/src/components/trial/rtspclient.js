import React, { useState } from 'react'
import camera from '../images/camera.webp';
import logo from '../images/RURUTEK - Logo Original.svg';
import { useNavigate } from 'react-router-dom';
import './jsmplayer.css'
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '../store/store';
import { ClipLoader } from "react-spinners";
import axios from '../api/axios';

export default function Rtspclient() {
  const dispatch = useDispatch();
  const message = useSelector(state => state.mainStore.message)
  const [clientform, setClientform] = useState({
    username: '',
    password: '',
    host: ''
  });

  const navigate = useNavigate()

  function handleInput(e) {
    const { name, value } = e.target;
    setClientform((prev) => ({ ...prev, [name]: value }))
  }

  function Start(e) {
    e.preventDefault();
    dispatch(actions.setMessage('Connecting...'))
    if (clientform.host !== ' ') {
      let rtspHost = `rtsp://${clientform.username}:${clientform.password}@${clientform.host}`;
      let rtspHost1 = `rtsp://${clientform.username}:${clientform.password}@${clientform.host}`;
      axios.post('/',[{ rtspHost: rtspHost, start_stop: 'Start' },{rtspHost: rtspHost1, start_stop: 'Start'}]).then((res) => {
        res.data?.message === 'Connected Successfully' && navigate('/Stream'); dispatch(actions.setMessage(res.data.message))
      }).catch((err) => { dispatch(actions.setMessage(err.response.data.message)) })
    }
    else {
      alert('Enter a valid rtsp host')
    }
  }



  return (
    <div className='w-full h-screen bg-sky-900 tracking-wide' id='fontthis'>
      <div className='flex justify-center items-center h-full'>
        <div className='w-5/6 h-5/6 md:h-4/6 sm:h-4/6 xs:h-4/6 2xs:h-4/6 flex justify-between md:w-full md:mx-10 sm:w-full sm:mx-2 xs:w-full xs:mx-2 2xs:w-full 2xs:mx-5 md:justify-center  sm:justify-center  xs:justify-center  2xs:justify-center  bg-white'>
          <div className='w-3/5 flex items-center px-20 md:hidden sm:hidden xs:hidden 2xs:hidden'>
            <div>
              <img src={camera} className='h-full'></img>
            </div>
          </div>
          <form className='w-2/5 h-full pr-20 md:w-5/6  sm:w-5/6  xs:w-5/6  2xs:w-5/6 md:pr-0 sm:pr-0 xs:pr-0 2xs:pr-0'>
            <div className='mt-10 flex justify-between items-center h-16 w-full'>
              <div>
                <p>sample rtsp : 172.16.0.204:554/ch01/1</p>
                <p>sample rtsp : 172.16.0.155:554/ch01/1</p>
                <p>username: admin</p>
                <p>password: admin@123</p>
              </div>
              <img src={logo} className='h-12'></img>
            </div>
            <div className='rounded-sm h-4/5 flex flex-col justify-center'>
              <div className='px-6 py-10 border shadow-md border-blue-800'>
                <div className='flex justify-between w-full'>
                  <p className='mb-7 py-2 px-1 border-b text-blue-800 text-lg font-semibold'>RTSP Client</p>
                  {message !== 'Connecting...' ? <p className='py-2 px-1 mb-7 text-red-600'>{message}</p> : <>{message === 'Connecting...' && <p className='py-2 px-1 mb-7 flex items-center'>
                    <ClipLoader color="#0c4a6e"
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"/>
                  </p>}</>}
                </div>
                <div className='flex justify-between items-center pb-4'>
                  <label>rtsp://</label>
                  <input type='text' className='border border-slate-400 focus:border focus:ring-0 focus:border-blue-600 rounded-sm w-4/5 py-1 px-2' value={clientform.host} name='host' onChange={(e) => handleInput(e)}></input>
                </div>
                <div className='flex justify-between items-center pb-4'>
                  <label>Username</label>
                  <input type='text' className='border border-slate-400 focus:border focus:ring-0 focus:border-blue-600  w-3/5  rounded-sm py-1 px-2' value={clientform.username} name='username' onChange={(e) => handleInput(e)}></input>
                </div>
                <div className='flex justify-between items-center pb-6'>
                  <label>Password</label>
                  <input type='text' className='border border-slate-400  focus:border focus:ring-0 focus:border-blue-600 w-3/5  rounded-sm py-1 px-2' value={clientform.password} name='password' onChange={(e) => handleInput(e)}></input>
                </div>
                <div className='flex justify-end'>
                  <button className={`border py-1 px-8 bg-blue-600 text-white  rounded-sm`} onClick={(e) => Start(e)} >Start</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import JSMpeg from '@cycjimmy/jsmpeg-player';
import logo from '../images/RURUTEK - Logo Original.svg';
import { AiOutlineFullscreen,AiOutlineInfoCircle } from 'react-icons/ai';
import {IoIosAdd} from 'react-icons/io';
import axios from './api/axios';
import {AiTwotoneDelete} from 'react-icons/ai'

export default function MultiRtsp() {

    const clientobjectforsave = {
        name:'',
        username: '',
        password: '',
        host: '',
    }

    const [forceRender,setForceRender] = useState(0)

    const [show, setShow] = useState('close')
    
    const [getSavedRTSP, setGetSavedRTSP] = useState([])

    const [saveClient, setSaveClient] = useState([]);

    const containerRef = useMemo(() => [React.createRef() , React.createRef()], []);


    const initialVideoRefs = Array.from({ length:  (getStoredUrls().length === 0 ? getSavedRTSP.length : getStoredUrls().length) }, () => React.createRef());

    const videoRefs = initialVideoRefs;


    function handleSaveInput(e, index) {
        const { name, value } = e.target;
        const values = [...saveClient];
        values[index][name] = value
        setSaveClient(values)
    }
 
    function AddSaveClient(){
        setSaveClient(prev => [...prev, {id: prev.length, ...clientobjectforsave}])
    }
    console.log(saveClient)
    function DeleteSaveClient(id){
        setSaveClient(prev => prev.filter((pre)=> id !== pre.id));
    }
    
    function handleCheck(e,client, index){
        if(e.target.checked === true){
            setGetSavedRTSP(prev => [...prev, client])
        }
        else{
            setGetSavedRTSP(prev => prev.filter((prev)=> client.id !== prev.id))
        }   
    }


    function SaveSaveClient(e){
        e.preventDefault();
        axios.post('/SaveRTSP',saveClient).then(()=> {
            setForceRender(prev => prev + 1)
        })
    }

    function GoSaveClientLive(e){
        e.preventDefault();
        const storedUrls = getStoredUrls();
        const rtspHost = getSavedRTSP.map((client, index) => {
            return `rtsp://${client.username}:${client.password}@${client.host}`;
        });
        const savedURl = [...rtspHost, ...storedUrls]
        const uniqueUrls = [...new Set(savedURl)];
        storeUrls(uniqueUrls);
        if (!uniqueUrls) {
            return;
        }
        if (!player) {
            createPlayer(uniqueUrls);
        } else {
            player.destroy();
            createPlayer(uniqueUrls);
        }
    }

    useEffect(() => {
        axios.get('/getSavedRTSP').then((res) => {
            setGetSavedRTSP(res.data)
            setSaveClient(res.data)
        })
    },[forceRender])


    let player;
    function createPlayer(url) {
        url.forEach((host, index) => {
            try {
                 player = new JSMpeg.Player(`ws://${window.location.hostname}:9999?url=${encodeURIComponent(host)}`, {
                    autoplay: false,
                    audio: false,
                    canvas: videoRefs[index].current,
                    videoBufferSize: 10 * 1024 * 1024,
                    reconnectInterval: 5,
                    disableWebAssembly: true,
                    onSourceEstablished: (data) => {

                        console.log('onSourceEstablished', data);

                        data.socket.onclose = closeEvent => {
                            console.log('socket onclose', closeEvent);
                            console.log(closeEvent.reason ? closeEvent.reason : 'socket closed');
                        };

                        data.socket.onerror = error => {
                            console.log('socket on error', error);
                        };

                    },
                    onCompletedCallback: data => {
                        console.log('onCompletedCallback', data);
                    },
                });

            } catch (error) {
                console.log('catched error', error);
            }
        })
    }

    function clearStoredUrls() {
        localStorage.removeItem('rtspUrls');
        window.location.reload()
    }

    // Store RTSP URLs in local storage
    function storeUrls(urls) {
        localStorage.setItem('rtspUrls', JSON.stringify(urls));
    }

    // Retrieve RTSP URLs from local storage
    function getStoredUrls() {
        const storedUrls = localStorage.getItem('rtspUrls');
        return storedUrls ? JSON.parse(storedUrls) : [];
    }

    function handleFullscreen(canvas) {
        if (canvas.current) {
            if (canvas.current.requestFullscreen) {
                canvas.current.requestFullscreen();
            }else if (canvas.current.mozRequestFullScreen) { // Firefox
                canvas.current.mozRequestFullScreen();
            } else if (canvas.current.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                canvas.current.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) { // IE/Edge
                canvas.current.msRequestFullscreen();
            }
        }
    }

    // Function to handle refresh
    function handleRefresh() {
        const storedUrls = getStoredUrls();

        if (storedUrls) {
            if (!player) {
                createPlayer(storedUrls);
            } else {
                player.destroy();
                createPlayer(storedUrls);
            }
        }
    }

    useEffect(() => {
        handleRefresh();
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            containerRef.forEach(element => {
                if (element.current && !element.current.contains(event.target)) {
                    setShow('close')
                  }
            });
         
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [containerRef]);
      
    return (
        <div className='text-white'>
            <nav className='h-16 mt-1 px-5'>
                <div className='flex justify-between items-center h-full'>
                    <div>
                        <img src={logo} alt='logo'></img>
                    </div>
                    <div className='flex items-center gap-2'>
                        <i className='text-white relative' onMouseEnter={() => setShow('note')} onMouseLeave={() => setShow('close')}><AiOutlineInfoCircle className=' w-7 h-7'/>{show === 'note' && <div className='bg-white absolute right-0 top-[105%] p-5 rounded-md whitespace-nowrap text-black z-10'><p>Note: Stop the stream before restarting another stream</p></div>}</i>
                    <div className='relative' >
                            <button className='py-2 px-3 rounded-md border hover:bg-slate-50 hover:text-black' type='button'  onClick={() => setShow(prev => prev === 'savedrtsp'? 'close' : 'savedrtsp') }>SAVED RTSP</button>
                            {
                            (show === 'savedrtsp' && getSavedRTSP.length !== 0) &&  <div className='bg-white rounded-md p-5 absolute right-0 top-[105%] flex flex-col gap-1 overflow-auto max-h-[60vh] z-10 text-black' ref={containerRef[0]}>
                            {saveClient.map((client, index) =>
                                 <div className='flex justify-between items-center gap-10' key={index}>
                                <label>
                                <p>{client.name}</p>
                                <small>{client.host}</small>
                                </label>
                                <input type='checkbox' className='focus:ring-0' defaultChecked={true} onChange={(e) => handleCheck(e,client)}></input>
                                </div>
                            )}
                                <div className={`flex justify-end mt-2`}>                                 
                                    <button className='border text-slate-50 py-1 px-3 rounded-md bg-blue-500' type='button' onClick={(e) => GoSaveClientLive(e)}>Go Live</button>
                                </div>
                            </div>
                            }
                        </div>
                        <form className='relative'  onSubmit={(e) => SaveSaveClient(e)}>
                            <button className='py-2 px-3 rounded-md border hover:bg-slate-50 hover:text-black' type='button' onClick={() => setShow(prev => prev === 'addrtsp'? 'close' : 'addrtsp') }>+ ADD RTSP</button>
                                {show === 'addrtsp' && <div className='bg-white rounded-md p-5 absolute right-0 top-[105%] flex flex-col gap-3 overflow-auto max-h-[60vh] z-10' ref={containerRef[1]}>
                                {saveClient.map((client, index) =>
                                    <div key={client.id} className='flex gap-2'>
                                        {console.log(saveClient)}
                                        <input type='text' className='border border-slate-400 focus:border focus:ring-0 focus:border-blue-600 rounded-sm  py-1 px-2 text-black' name='name'  defaultValue={client.name} onChange={(e) => handleSaveInput(e,index)} placeholder='Name' required></input>
                                        <input type='text' className='border border-slate-400 focus:border focus:ring-0 focus:border-blue-600 rounded-sm  py-1 px-2 text-black' name='host'  defaultValue={client.host}  onChange={(e) => handleSaveInput(e,index)} placeholder='RTSP' required></input>
                                        <input type='text' className='border border-slate-400 focus:border focus:ring-0 focus:border-blue-600 rounded-sm py-1 px-2 text-black' name='username'  defaultValue={client.username}  onChange={(e) => handleSaveInput(e,index)} placeholder='username' required></input>
                                        <input type='text' className='border border-slate-400  focus:border focus:ring-0 focus:border-blue-600 rounded-sm py-1 px-2 text-black' name='password'  defaultValue={client.password}  onChange={(e) => handleSaveInput(e,index)} placeholder='password' required></input>
                                        <button className='border text-slate-50 py-1 px-3 rounded-md bg-red-500' type='button' onClick={() => DeleteSaveClient(client.id)}><AiTwotoneDelete></AiTwotoneDelete></button>
                                    </div>
                                )}
                                 <div className={`flex justify-center items-center gap-3`}>
                                    <button className='border-2 text-slate-300 p-0.5 rounded-full' type='button' onClick={() => AddSaveClient()}><IoIosAdd className='h-8 w-8 text-slate-300'></IoIosAdd></button>                    
                                    <button className='border text-slate-50 py-1 px-3 rounded-md bg-blue-500' type='submit'>Save</button>
                                </div>
                            </div>}
                        </form>
                        
                        <button className='py-2 px-3 rounded-sm bg-red-600' type='button' onClick={() => clearStoredUrls()}>STOP STREAM</button>
                        <button className='py-2 px-3 rounded-sm bg-blue-600' type='button' onClick={(e) => GoSaveClientLive(e)}>GO LIVE</button>
                    </div>
                </div>
            </nav>
            <div className='grid grid-cols-3 gap-1 mt-2' >
                    {videoRefs.map((ref, index) => <div className='w-full h-[311.20001220703125px] relative border' key={index}>
                        <canvas className='w-full h-full' ref={ref} />
                        <div className='absolute top-3 right-3' onClick={() => handleFullscreen(ref)}><AiOutlineFullscreen></AiOutlineFullscreen></div>
                    </div>)}
            </div>
        </div>
    )
}

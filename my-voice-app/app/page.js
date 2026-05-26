'use client';
import { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';

export default function Home() {
  const [roomConnected, setRoomConnected] = useState(false);
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('我的专属房间');
  const [nickname, setNickname] = useState('游客');
  const roomRef = useRef(null);

  const INITIAL_COINS = 100;
  const DAILY_REWARD = 30;
  const [coins, setCoins] = useState(INITIAL_COINS);

  const gifts = [
    { name: '小心心', emoji: '❤️', cost: 10 },
    { name: '玫瑰', emoji: '🌹', cost: 20 },
    { name: '啤酒', emoji: '🍺', cost: 50 },
    { name: '跑车', emoji: '🏎️', cost: 200 },
    { name: '火箭', emoji: '🚀', cost: 500 },
  ];
  const [giftLog, setGiftLog] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSignDate = localStorage.getItem('lastSignDate');
    const storedCoins = localStorage.getItem('coins');
    const localName = localStorage.getItem('userNick');

    if (storedCoins) setCoins(Number(storedCoins));
    if (localName) setNickname(localName);

    if (lastSignDate !== today) {
      const newCoins = (storedCoins ? Number(storedCoins) : INITIAL_COINS) + DAILY_REWARD;
      setCoins(newCoins);
      localStorage.setItem('coins', newCoins);
      localStorage.setItem('lastSignDate', today);
      alert('🎉 今日签到成功！获得 30 金币~');
    }
  }, []);

  const saveNick = () => {
    localStorage.setItem('userNick', nickname);
    alert('昵称设置成功');
  };

  const sendMessage = () => {
    if(!msgText.trim()) return;
    const newMsg = {
      sender: nickname,
      content: msgText,
      time: new Date().toLocaleTimeString()
    };
    setChatList([...chatList, newMsg]);
    setMsgText('');
  };

  async function joinRoom() {
    const response = await fetch('https://token-demo.livekit.io/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName }),
    });
    const tokenData = await response.text();
    setToken(tokenData);

    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.Connected, () => {
      setRoomConnected(true);
    });

    await room.connect('wss://wss.livekit.io', tokenData);
  }

  function leaveRoom() {
    if (roomRef.current) {
      roomRef.current.disconnect();
      setRoomConnected(false);
    }
  }

  function sendGift(gift) {
    if (coins >= gift.cost) {
      setCoins(prev => prev - gift.cost);
      localStorage.setItem('coins', coins - gift.cost);
      setGiftLog(prev => [...prev, { ...gift, time: new Date().toLocaleTimeString() }]);
    } else {
      alert('😢 金币不足，快去签到领金币吧！');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '20px', 
        padding: '30px', 
        width: '100%', 
        maxWidth: '500px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#333', 
          marginBottom: '20px',
          fontSize: '28px',
          fontWeight: '700'
        }}>🎤 我的语音厅</h1>

        <div style={{display:'flex',gap:'8px',marginBottom:'15px'}}>
          <input
            value={nickname}
            onChange={(e)=>setNickname(e.target.value)}
            placeholder="设置你的昵称"
            style={{flex:1,padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}}
          />
          <button onClick={saveNick} style={{padding:'0 15px',border:'none',background:'#667eea',color:'#fff',borderRadius:'8px'}}>保存</button>
        </div>

        <div style={{ 
          background: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)', 
          borderRadius: '12px', 
          padding: '12px 20px', 
          marginBottom: '25px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '10px',
          color: 'white',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <span>当前金币：{coins}</span>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="输入房间名称"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #eee',
              marginBottom: '15px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
          {!roomConnected ? (
            <button
              onClick={joinRoom}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              进入语音厅
            </button>
          ) : (
            <button
              onClick={leaveRoom}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              离开房间
            </button>
          )}
        </div>

        {roomConnected && (
          <div style={{marginBottom:'20px',border:'1px solid #eee',borderRadius:'12px',padding:'15px'}}>
            <h3 style={{margin:'0 0 10px 0',color:'#333'}}>💬 私聊对话</h3>
            <div style={{height:'140px',overflowY:'auto',background:'#f9f9f9',borderRadius:'8px',padding:'10px',marginBottom:'10px'}}>
              {chatList.length === 0 ? (
                <p style={{color:'#999',textAlign:'center'}}>暂无聊天消息</p>
              ) : (
                chatList.map((item,idx)=> (
                  <div key={idx} style={{margin:'6px 0'}}>
                    <span style={{color:'#667eea',fontWeight:500}}>{item.sender}</span>
                    <span style={{fontSize:'12px',color:'#999',marginLeft:'6px'}}>{item.time}</span>
                    <p style={{margin:'2px 0 0 10px',color:'#333'}}>{item.content}</p>
                  </div>
                ))
              )}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input
                value={msgText}
                onChange={(e)=>setMsgText(e.target.value)}
                onKeyDown={(e)=>e.key==='Enter'&&sendMessage()}
                placeholder="输入私信内容"
                style={{flex:1,padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}}
              />
              <button onClick={sendMessage} style={{padding:'0 18px',border:'none',background:'#667eea',color:'#fff',borderRadius:'8px'}}>发送</button>
            </div>
          </div>
        )}

        {roomConnected && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>🎁 礼物互动区</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {gifts.map((gift, index) => (
                <button
                  key={index}
                  onClick={() => sendGift(gift)}
                  style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    border: '2px solid #eee',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#eee';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{gift.emoji}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>{gift.name}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>{gift.cost}金币</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {giftLog.length > 0 && (
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            <h4 style={{ color: '#333', marginBottom: '10px' }}>礼物记录</h4>
            {giftLog.slice(-5).map((log, index) => (
              <p key={index} style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                [{log.time}] 送出了 {log.emoji} {log.name}
              </p>
            ))}
          </div>
        )}

        {roomConnected && (
          <div style={{ 
            background: '#e8f5e9', 
            borderRadius: '12px', 
            padding: '20px', 
            textAlign: 'center',
            color: '#2e7d32'
          }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>✅ 已成功连接到房间：{roomName}</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>语音聊天、私信互动、赠送礼物全都支持</p>
          </div>
        )}
      </div>
    </div>
  );
}
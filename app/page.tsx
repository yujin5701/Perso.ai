// 'use client';
// import { useState, useEffect, useRef } from 'react';

// type ChatMessage = {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string; // ✅ 메시지 시간 추가
// };

// export default function Page() {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState('');
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // 🔄 자동 스크롤
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // 💬 첫 인삿말
//   useEffect(() => {
//     const now = new Date().toLocaleTimeString('ko-KR', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//     setMessages([
//       {
//         role: 'assistant',
//         // ✅ \n을 넣어서 줄바꿈 처리
//         content: '안녕하세요!😊 Perso.ai 챗봇입니다.\n무엇이 궁금하신가요?',
//         timestamp: now,
//       },
//     ]);
//   }, []);

//   // ✉️ 메시지 전송
//   async function send() {
//     if (!input.trim()) return;

//     const now = new Date().toLocaleTimeString('ko-KR', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//     const userMessage = {
//       role: 'user' as const,
//       content: input,
//       timestamp: now,
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     try {
//       const res = await fetch('/api/qa', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: input }),
//       });

//       const data = await res.json();
//       const answer =
//         data.answer ||
//         '질문이 데이터와 일치하지 않습니다 😅 조금 더 구체적으로 물어보세요.';

//       const botMessage = {
//         role: 'assistant' as const,
//         content: answer,
//         timestamp: new Date().toLocaleTimeString('ko-KR', {
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//       };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (err) {
//       console.error('❌ API Error:', err);
//       const errorMsg = {
//         role: 'assistant' as const,
//         content: '서버 오류가 발생했습니다 😢',
//         timestamp: new Date().toLocaleTimeString('ko-KR', {
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     }

//     setInput('');
//   }

//   return (
//     <main
//       style={{
//         maxWidth: 440,
//         margin: '3rem auto',
//         padding: 20,
//         fontFamily: 'Pretendard, sans-serif',
//         background: '#f9f9f9',
//         borderRadius: 20,
//         boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
//         display: 'flex',
//         flexDirection: 'column',
//         height: '80vh',
//       }}
//     >
//       {/* 🏷️ 헤더 */}
//       <h2
//         style={{
//           textAlign: 'center',
//           fontWeight: 700,
//           fontSize: '1.3rem',
//           marginBottom: '1rem',
//           color: '#222',
//         }}
//       >
//         Perso.ai Chat
//       </h2>

//       {/* 💭 채팅 영역 */}
//       <div
//         style={{
//           flex: 1,
//           overflowY: 'auto',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '12px',
//           padding: '12px',
//           background: '#fff',
//           borderRadius: 12,
//           boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
//         }}
//       >
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             style={{
//               display: 'flex',
//               flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
//               alignItems: 'flex-end',
//               alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
//               gap: '8px',
//               marginBottom: '8px',
//             }}
//           >
//             {/* 💬 말풍선 */}
//             <div
//               style={{
//                 maxWidth: m.role === 'user' ? '95%' : '90%',
//                 padding: '10px 14px',
//                 borderRadius:
//                   m.role === 'user'
//                     ? '16px 16px 0 16px'
//                     : '16px 16px 16px 0',
//                 fontSize: '0.95rem',
//                 lineHeight: 1.45,
//                 whiteSpace: 'pre-wrap',
//                 background:
//                   m.role === 'user'
//                     ? 'linear-gradient(135deg, #A8D8FF 0%, #66B6FF 100%)'
//                     : '#F3F3F3',
//                 color: m.role === 'user' ? '#fff' : '#222',
//                 boxShadow:
//                   m.role === 'user'
//                     ? '0 2px 8px rgba(102,182,255,0.35)'
//                     : '0 2px 6px rgba(0,0,0,0.08)',
//               }}
//             >
//               {m.content}
//             </div>

//             {/* 🕒 메시지 시간 표시 */}
//             <small
//               style={{
//                 color: '#888',
//                 fontSize: '0.75rem',
//                 marginBottom: '4px',
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               {m.timestamp}
//             </small>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* ✏️ 입력창 */}
//       <div
//         style={{
//           display: 'flex',
//           marginTop: 12,
//           borderTop: '1px solid #eee',
//           paddingTop: 10,
//           background: '#fff',
//           borderRadius: 12,
//         }}
//       >
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="질문을 입력하세요..."
//           style={{
//             flex: 1,
//             padding: '10px 12px',
//             borderRadius: 12,
//             border: '1px solid #ddd',
//             outline: 'none',
//             fontSize: '0.95rem',
//             background: '#fff',
//           }}
//           onKeyDown={(e) => e.key === 'Enter' && send()}
//         />
//         <button
//           onClick={send}
//           style={{
//             marginLeft: 8,
//             background: '#66B6FF',
//             color: '#fff',
//             border: 'none',
//             borderRadius: 12,
//             padding: '0 18px',
//             cursor: 'pointer',
//             fontWeight: 600,
//             transition: '0.2s',
//           }}
//           onMouseOver={(e) => (e.currentTarget.style.background = '#4AA9FF')}
//           onMouseOut={(e) => (e.currentTarget.style.background = '#66B6FF')}
//         >
//           전송
//         </button>
//       </div>
//     </main>
//   );
// }

'use client';
import { useState, useEffect, useRef } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string; timestamp: string };

function dotStyle(delay: number): React.CSSProperties {
  return {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#999',
    opacity: 0.3,
    animation: `blink 1.2s infinite`,
    animationDelay: `${delay}s`,
  };
}
export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 첫 인삿말
  useEffect(() => {
    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        role: 'assistant',
        content: '안녕하세요!😊 Perso.ai 챗봇입니다.\n무엇이 궁금하신가요?',
        timestamp: now,
      },
    ]);
  }, []);

  // 메시지 전송
  async function send() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const userMessage = { role: 'user' as const, content: input, timestamp: now };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true); // ✅ 타이핑 시작 표시
    setInput('');

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();
      const answer =
        data.answer || '질문이 데이터와 일치하지 않습니다 😅 조금 더 구체적으로 물어보세요.';

      const botMessage = {
        role: 'assistant' as const,
        content: answer,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('❌ API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '서버 오류가 발생했습니다 😢',
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsTyping(false); // ✅ 타이핑 종료
    }
  }

  return (
    <main
      style={{
        maxWidth: 440,
        margin: '3rem auto',
        padding: 20,
        fontFamily: 'Pretendard, sans-serif',
        background: '#f9f9f9',
        borderRadius: 20,
        boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
      }}
    >
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem', color: '#222' }}>
        Perso.ai Chat
      </h2>

      {/* 메시지 영역 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '12px',
          background: '#fff',
          borderRadius: 12,
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '8px',
            }}
          >
            <div
              style={{
                maxWidth: m.role === 'user' ? '95%' : '90%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                fontSize: '0.95rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                background:
                  m.role === 'user'
                    ? 'linear-gradient(135deg, #A8D8FF 0%, #66B6FF 100%)'
                    : '#F3F3F3',
                color: m.role === 'user' ? '#fff' : '#222',
                boxShadow:
                  m.role === 'user'
                    ? '0 2px 8px rgba(102,182,255,0.35)'
                    : '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {m.content}
            </div>
            <small style={{ color: '#888', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              {m.timestamp}
            </small>
          </div>
        ))}

        {/* ✅ Typing indicator */}
        {isTyping && (
  <div
    style={{
      alignSelf: 'flex-start',
      background: '#F3F3F3',
      borderRadius: '16px 16px 16px 0',
      padding: '10px 14px',
      color: '#666',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '32px',
    }}
  >
    <span></span>
    <div style={{ display: 'flex', gap: '4px' }}>
      <span className="dot" style={dotStyle(0)}></span>
      <span className="dot" style={dotStyle(0.2)}></span>
      <span className="dot" style={dotStyle(0.4)}></span>
    </div>
  </div>
)}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div
        style={{
          display: 'flex',
          marginTop: 12,
          borderTop: '1px solid #eee',
          paddingTop: 10,
          background: '#fff',
          borderRadius: 12,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요..."
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid #ddd',
            outline: 'none',
            fontSize: '0.95rem',
          }}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          style={{
            marginLeft: 8,
            background: '#66B6FF',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '0 18px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: '0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#4AA9FF')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#66B6FF')}
        >
          전송
        </button>
      </div>
    </main>
  );
}
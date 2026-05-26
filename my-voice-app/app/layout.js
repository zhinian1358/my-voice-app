export const metadata = {
  title: '我的语音厅',
  description: '一个可以聊天、送礼物的在线语音房间',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
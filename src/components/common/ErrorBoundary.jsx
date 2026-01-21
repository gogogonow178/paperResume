import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // 你同样可以将错误日志上报给服务器
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                        出错了 (Something went wrong)
                    </h1>
                    <p style={{ marginBottom: '24px', color: '#6B7280' }}>
                        应用程序遇到一个意外错误，无法继续运行。
                    </p>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: '#E5E7EB', padding: '16px', borderRadius: '8px', maxWidth: '600px', overflow: 'auto' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '24px',
                            padding: '10px 20px',
                            backgroundColor: '#2563EB',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        刷新页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

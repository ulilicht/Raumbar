import React from 'react';
import './ErrorBoundary.css';
import newGithubIssueUrl from 'new-github-issue-url';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            showError: false
        };
    }

    componentDidMount() {

        const onErrorHandler = (errorEvent) => {
            if (errorEvent.error.message.startsWith('EROFS: read-only file system, open \'/app.')) {
                // this occurs within node-raumkernel if the app has no permissions to write to the filesystem.
                // I would like to avoid giving those permissions to the app if not needed.
                return;
            }

            this.setState({
                hasError: true,
                error: errorEvent.error.message,
                errorInfo: errorEvent.error.stack
            });
        }

        window.addEventListener('error', onErrorHandler.bind(this));
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        });
        console.log(errorInfo);
    }

    onOpenIssueButtonClick() {
        newGithubIssueUrl({
            user: 'ulilicht',
            repo: 'Raumbar',
            title: `AUTOREPORT: ${this.state.error}`,
            body: this.state.errorInfo
        });
    }

    onReloadButtonClick() {
        window.location.reload();
    }

    onReportButtonClick() {
        const reportText = `Provide more information about your setup: 
        
        
        
        ---------------------------------------
        ${this.state.errorInfo}`;


        const githubUrl = newGithubIssueUrl({
            user: 'ulilicht',
            repo: 'Raumbar',
            title: `AUTOREPORT: ${this.state.error}`,
            body: reportText
        });
        navigator.clipboard.writeText(githubUrl);
    }

    render() {
        const errorDetails = (
            <div>
                <div className="ErrorBoundary-report">
                    You can report this issue by copying a URL to the clipboard and opening this url in your browser.
                    <button className="ErrorBoundary-reportButton" onClick={this.onReportButtonClick.bind(this)}>Copy
                    </button>
                </div>
                <div className="ErrorBoundary-error">
                    <div className="ErrorBoundary-errorHeadline">{this.state.error && this.state.error.toString()}</div>
                    <div
                        className="ErrorBoundary-errorDetails">{this.state.errorInfo && this.state.errorInfo}</div>
                </div>
            </div>
        );

        if (this.state.hasError) {
            return (
                <div className="ErrorBoundary">
                    <div className="ErrorBoundary-message">An error occurred. Try reloading the app.</div>
                    <div className="ErrorBoundary-buttons">
                        <button className="ErrorBoundary-reloadButton" onClick={this.onReloadButtonClick}>Reload
                        </button>
                        <button className="ErrorBoundary-showError"
                                onClick={() => this.setState({showError: !this.state.showError})}>ShowError
                        </button>
                    </div>
                    {this.state.showError && errorDetails}
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
import { Component, type ReactNode } from 'react'
import { Button, Result } from 'antd'
import { errorTracker } from '@/utils/errorTracking'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorTracker.logError(error, { errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Something went wrong"
          subTitle="Sorry, an unexpected error occurred."
          extra={
            <Button type="primary" onClick={this.handleReset}>
              Back to Home
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
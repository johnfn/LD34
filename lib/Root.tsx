interface RootProps {
  stage: Stage;
  debug?: boolean;
}

interface RootState {
  target: Sprite;
  debugLayer: DebugLayer;
}


/**
 * Root is the react component at the base of the HTML hierarchy.
 */
class Root extends React.Component<RootProps, RootState> {
  constructor(props: RootProps) {
    super(props);

    let debugLayer = new DebugLayer(this.props.stage);

    this.state = {
      target: null,
      debugLayer: debugLayer
    };
  }

  setTarget(target: Sprite) {
    this.setState(state => {
      state.target = target;

      return state;
    });

    Debug.instance.events.emit(DebugEvents.ChangeTarget, target);
  }

  render() {
    let hierarchy: JSX.Element = null,
        inspector: JSX.Element = null,
        log      : JSX.Element = null;

    if (this.props.debug && Debug.DEBUG_MODE) {
      hierarchy = <Hierarchy root={ this } target={ this.props.stage } debugLayer={ this.state.debugLayer } focus={ this.state.target } />;
      inspector = <Inspector debugLayer={ this.state.debugLayer } target={ this.state.target } />;
    }

    if (this.props.debug) {
      log = <Log stage={ this.props.stage } debugLayer={ this.state.debugLayer } root={ this } />;
    }

    return (
      <div>
        <div id="main-panel">
          <div id="hierarchy">
            { hierarchy }
          </div>
          <div id="content" className="content"></div>
          { inspector }
        </div>

        { log }
      </div>
    );
  }
}

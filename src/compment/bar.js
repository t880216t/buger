import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Easing,
} from 'react-native';

class Bar extends Component {

    constructor(props) {
        super(props);
        this.progress = new Animated.Value(this.props.initialProgress || 0);
    }

    static defaultProps = {
        style: styles,
        easing: Easing.inOut(Easing.ease)
    }

    componentWillReceiveProps(nextProps)  {
        if (this.props.progress >= 0 && this.props.progress !== nextProps.progress) {
            this.update(nextProps.progress);
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    update(progress) {
        Animated.spring(this.progress, {
            toValue: progress
        }).start();
    }

    render() {
        return (
            <View style={[styles.background, this.props.backgroundStyle, this.props.style]}>
                <Animated.View style={[styles.fill, this.props.fillStyle, { width: this.progress.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0 * this.props.style.width, 1 * this.props.style.width],
                    })} ]}
                />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    background: {
        backgroundColor: '#bbbbbb',
        height: 5,
        overflow: 'hidden'
    },
    fill: {
        backgroundColor: 'rgba(0, 122, 255, 1)',
        height: 5
    }
});

export default Bar;
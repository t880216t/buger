/* eslint-disable prefer-destructuring,no-undef-init,import/newline-after-import */
import React, {Component} from 'react'
import {View, StyleSheet, ActivityIndicator, Dimensions} from 'react-native'
import RootSiblings from 'react-native-root-siblings'
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

let sibling = undefined

const Loading = {

  show: () => {
    sibling = new RootSiblings(
      <View style={styles.maskStyle}>
        <View style={styles.backViewStyle}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>
    )
  },

  hidden: ()=> {
    if (sibling instanceof RootSiblings) {
      sibling.destroy()
    }
  }

}

const styles = StyleSheet.create({
    maskStyle: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      width: width,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    backViewStyle: {
      backgroundColor: '#111',
      width: 120,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
    }
  }
)

export {Loading}

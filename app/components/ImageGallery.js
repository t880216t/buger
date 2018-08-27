/* eslint-disable no-underscore-dangle,prefer-const,class-methods-use-this,react/sort-comp */
import React, {PureComponent, Fragment} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
  Modal,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native'
import Gallery from 'react-native-image-gallery'

export default class ImageGallery extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      images: [],
      show: false,
      current: this.props.current || 0,
    }
    this.onChangeImage = this.onChangeImage.bind(this)
    this.formatImageList = this.formatImageList.bind(this)
  }

  componentWillMount() {
    this.formatImageList(this.props.imgList)
  }


  formatImageList(images) {
    let list = []
    images.forEach(item => {
      let uri = ""
      if(item.mimeType === "image/png"||item.mimeType === "image/jpeg"){
        uri = item.content
        let newItem = {}
        newItem.source = {}
        newItem.source.uri = uri
        list.push(newItem)
      }else if(item.mimeType === "multipart/form-data"){
        if(item.filename.indexOf("jpg") > -1 || item.filename.indexOf("jpeg") > -1 || item.filename.indexOf("png") > -1  ){
          uri = item.thumbnail
          let newItem = {}
          newItem.source = {}
          newItem.source.uri = uri
          list.push(newItem)
        }
      }
    })
    this.setState({images:list})
  }

  renderImage (imageProps, dimensions) {
    const { width, height } = dimensions || {}
    // Display the loader until the dimensions are available, which means the image
    // has been loaded
    return width && height ? (
      <Image {...imageProps} />
    ) : (
      <ActivityIndicator />
    )
  }

  onChangeImage(index) {
    this.setState({index})
  }

  renderError() {
    return (
      <View style={{flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{color: 'white', fontSize: 15, marginTop: 100}}>
          This image cannot be displayed...
        </Text>
      </View>
    )
  }

  galleryCount() {
    const {index, images} = this.state
    return (
      <View style={s.countWrap}>
        <View style={s.count}>
          <Text style={{color: 'white', fontSize: 12,}}>
            {index + 1}/{images.length}
          </Text>
        </View>
      </View>
    )
  }

  closeGallery() {
    this.setState({
      show: false,
      index: 0,
      current: 0
    })

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000')
    } else {
      StatusBar.setHidden(false)
    }
  }

  openGallery(index, imageList) {
    let params = {
      show: true,
      index,
      current: index
    }

    let open = () => {
      this.setState(params)
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#000')
      } else {
        StatusBar.setHidden(true)
      }
    }

    if (imageList) {
      this._imageWithToken(imageList, () => {
        open()
      })
    } else {
      open()
    }
  }

  render() {
    return (
      <Fragment>
        <Modal
          transparent={false}
          visible={this.state.show}
          style={s.wrap}
          onRequestClose={() => this.closeGallery()}
        >
          <TouchableOpacity
            style={s.close} onPress={() => this.closeGallery()}>
            <Image
              style={{height: 30, width: 30}}
              source={require("../images/close_white.png")}/>
          </TouchableOpacity>

          {this.state.show &&
          <Gallery
            style={{flex: 1, backgroundColor: '#000'}}
            images={this.state.images}
            imageComponent={this.renderImage}
            errorComponent={this.renderError}
            onPageSelected={this.onChangeImage}
            initialPage={this.state.current}
            // index={this.state.current}
            loader={
              <View style={s.load}>
                <ActivityIndicator color='#fff' size='large'/>
              </View>

            }
            flatListProps={{
              initialNumToRender: 10,
              // keyExtractor: (item, index) => index.toString(),
              initialScrollIndex: this.state.current,
              getItemLayout: (data, index) => ({
                length: Dimensions.get('screen').width,
                offset: Dimensions.get('screen').width * index,
                index,
              }),
            }}

          />
          }

          {this.galleryCount()}

        </Modal>


      </Fragment>
    )
  }
}


const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    flex: 1,
    backgroundColor: 'transparent',
  },
  load: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    position: 'absolute',
    right: 15,
    top: 27,
    zIndex: 100,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15
  },
  countWrap: {
    bottom: 40,
    width: '100%',
    position: 'absolute',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  count: {
    display: 'flex',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 15,
    flexShrink: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.5)',
    overflow: 'hidden',
  }

})

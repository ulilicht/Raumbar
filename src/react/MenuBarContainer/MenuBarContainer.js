import Slider from 'react-rangeslider';
import React from 'react';
import {Pause, Play, Volume2, VolumeX, Speaker, Loader, Music, FastForward} from 'react-feather';
import 'react-rangeslider/lib/index.css';
import './MenuBarContainer.css';

class VolumeSlider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            volumeValueInternal: props.nowPlaying.volume
        };
        this.mouseWheelEventInProgress = false;
    }

    setVolumeValueInternal(value) {
        this.setState({
            volumeValueInternal: value
        });
    }

    changeVolume() {
        this.props.setVolume(this.state.volumeValueInternal);
    }

    componentDidUpdate(prevProps) {
        if (this.props.nowPlaying.volume && (this.props.nowPlaying.volume !== prevProps.nowPlaying.volume)) {
            this.setVolumeValueInternal(this.props.nowPlaying.volume);
        }
    }

    onWheel(event) {
        if (event.deltaX !== 0) {
            const scrollIncrement = Math.sign(event.deltaX) * 0.3;
            this.setVolumeValueInternal(this.state.volumeValueInternal - scrollIncrement);


            // when adjusting the volume with mousewheel, send the change only every 1 second to outside.
            if (this.mouseWheelEventInProgress === false) {
                this.mouseWheelEventInProgress = true;
                setTimeout(() => {
                    this.mouseWheelEventInProgress = false;
                    this.changeVolume();
                }, 1000);
            }
        }
    }

    render() {
        return (
            <div className='volume-slider rounded module-bg' onWheel={(e) => this.onWheel(e)}>
                <div className='volume-slider-headline'>Volume</div>
                <div className='volume-slider-inner'>
                    <button type='button' className='icon' onClick={() => this.props.setMute()}>
                        <div style={{display: this.props.nowPlaying.isMuted ? 'inline-block' : 'none'}}>
                            <VolumeX/>
                        </div>
                        <div style={{display: this.props.nowPlaying.isMuted ? 'none' : 'inline-block'}}>
                            <Volume2/>
                        </div>
                    </button>
                    <div className='volume-slider-range'>
                        <Slider
                            min={0}
                            max={100}
                            value={this.state.volumeValueInternal}
                            tooltip={false}
                            orientation="horizontal"
                            onChange={value => this.setVolumeValueInternal(value)}
                            onChangeComplete={value => this.changeVolume(value)}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

const CurrentlyPlaying = (props) => {
    let playIcon = '';
    if (props.nowPlaying.isLoading) {
        playIcon = <Loader className='currently-playing-loading'/>
    } else {
        playIcon = props.nowPlaying.isPlaying ? <Pause/> : <Play/>
    }

    const onErrorAppendClass = (e) => {
        e.target.classList.add('currently-playing-image-error');
    }

    const shouldShowPlayPause = props.nowPlaying.canPlayPause || props.nowPlaying.isLoading;


    return (
        <div className='currently-playing rounded module-bg'>
            <div className='currently-playing-image'>
                {props.nowPlaying.image ?
                    <img src={props.nowPlaying.image} width="80" alt={props.nowPlaying.track}
                         onError={onErrorAppendClass}/> :
                    <div className="currently-playing-placeholder"></div>}
            </div>
            <div className='currently-playing-content'>
                <div>
                    <h4>{props.nowPlaying.track}</h4>
                    <p>{props.nowPlaying.artist}</p>
                </div>
            </div>
            <div className='currently-playing-controls'>
                {shouldShowPlayPause ? <button type='button' onClick={() => props.setPause()}>
                    {playIcon}
                </button> : ''}
                {props.nowPlaying.canPlayNext ?
                    <button className='currently-playing-controls-next' type='button' onClick={() => props.setNext()}>
                        {<FastForward/>}
                    </button> : ''}
            </div>
        </div>
    )
}

const Zone = (props) => {
    return (
        <div className='zone' onClick={props.onClick}>
            <button type='button' className={props.isSelected ? 'active' : ''}><Speaker/></button>
            <div className="zone-name">{props.zone.name} </div>
            <div className="zone-isPlaying">{props.zone.isPlaying && <Music/>}</div>
        </div>
    )
}

const ZoneSelector = (props) => {
    return (
        <div className='zone-selector'>
            <div className='divider'/>
            <div className='zone-headline'>Zones</div>
            {props.zones.map((zone, i) => {
                return (<Zone key={zone.udn} isSelected={zone.udn === props.selectedZoneUdn} zone={zone}
                              onClick={() => props.setZone(zone)}/>)
            })}
        </div>
    )
}

const Favourite = (props) => {
    let html = null;

    const onErrorAppendClass = (e) => {
        e.target.classList.add('favourite-image-error');
    }

    if (props.favourite.image) {
        html = (
            <div className='favourite' onClick={props.onClick}>
                <img src={props.favourite.image} alt={props.favourite.name} className="favourite-image"
                     onError={onErrorAppendClass}/>
            </div>
        )
    } else {
        html = (
            <div className='favourite' onClick={props.onClick}>
                <div className="favourite-image">{props.favourite.name}</div>
            </div>
        )
    }
    return html;
}

const Favourites = (props) => {
    return (
        <div>
            <div className='divider'/>
            <div className='favourites-headline'>Favourites</div>
            <div className="favourites">
                {props.favourites.map((favourite, i) => {
                    return (
                        <Favourite key={favourite.id} favourite={favourite}
                                   onClick={() => props.playFavourite(favourite)}/>)
                })}
            </div>
        </div>
    )
}

export default class MenuBarContainer extends React.Component {
    render() {
        if (this.props.selectedZoneUdn) {
            return (
                <div className='card-wrapper rounded'>
                    <CurrentlyPlaying nowPlaying={this.props.nowPlaying} setPause={this.props.setPause}
                                      setNext={this.props.setNext}/>
                    <VolumeSlider nowPlaying={this.props.nowPlaying} setMute={this.props.setMute}
                                  setVolume={this.props.setVolume}/>
                    <ZoneSelector zones={this.props.availableZones} selectedZoneUdn={this.props.selectedZoneUdn}
                                  setZone={this.props.setZone}/>
                    <Favourites favourites={this.props.favourites} playFavourite={this.props.playFavourite}/>
                </div>
            )
        } else {
            return (
                <div className='card-wrapper rounded'>
                    <ZoneSelector zones={this.props.availableZones} setZone={this.props.setZone}/>
                </div>
            )
        }
    }
}



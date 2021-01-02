import React from 'react';
import './App.css';
import MenuBarContainer from "./MenuBarContainer/MenuBarContainer";
import RaumkernelHelper from "./RaumkernelHelper/RaumkernelHelper";
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.raumkernelHelper = new RaumkernelHelper(window.raumkernel);
        this.didAutoSelectZoneOnFirstLaunch = false;
        this.state = {
            isReady: false,
            selectedZoneUdn: '',
            nowPlaying: {},
            availableZones: [],
            favourites: []
        };
    }

    getSelectedZone() {
        return this.state.availableZones.find(zone => zone.udn === this.state.selectedZoneUdn);
    }

    componentDidMount() {
        window.raumkernel.on('systemReady', (_ready) => {
            console.log('EVENT: systemReady', _ready);
            this.setState({
                isReady: true
            })

            this.loadFavourites();
        });

        window.raumkernel.on('combinedZoneStateChanged', this.handleCombinedZoneStateChanged.bind(this));
    }

    async handleCombinedZoneStateChanged(_combinedStateData) {
        // todo: Here is a bug: _combinedStateData for some reason changes while we are using it.
        // "rendererState" is only filled after some time which causes AutoselectZone to fail.

        if (!this.state.isReady) {
            return;
        }

        console.log('EVENT: combinedZoneStateChanged', _combinedStateData)

        const availableZones = this.raumkernelHelper.getAvailableZones(_combinedStateData);

        this.setState({
            availableZones: availableZones
        })

        let selectedZoneObj = this.getSelectedZone();
        if (!this.didAutoSelectZoneOnFirstLaunch || !selectedZoneObj) {
            this.didAutoSelectZoneOnFirstLaunch = true;

            let autoSelectZone = null;
            if (localStorage.selectedZoneName) {
                autoSelectZone = this.state.availableZones.find(zone => zone.name === localStorage.selectedZoneName);
            }

            if(!autoSelectZone){
                autoSelectZone = availableZones[0];
                // autoSelectZone = await this.raumkernelHelper.getAutoSelectZone(availableZones);
            }

            this.setZone(autoSelectZone);
            selectedZoneObj = autoSelectZone;
        }

        this.loadNowPlaying(selectedZoneObj);
    }

    loadNowPlaying(selectedZoneObj) {
        const nowPlaying = this.raumkernelHelper.getNowPlayingStateForZoneObj(selectedZoneObj);

        this.setState({nowPlaying: nowPlaying});
    }

    loadFavourites() {
        const favourites = [];
        const teufelFavourites = '0/Favorites/MyFavorites';
        //const teufelRecentlyPlayed = '0/Favorites/RecentlyPlayed';
        window.raumkernel.managerDisposer.mediaListManager.getMediaList(teufelFavourites, teufelFavourites)
            .then(favouriteMediaList => {
                console.log('receivedFavouriteMediaList', favouriteMediaList);
                favouriteMediaList.forEach(mediaListEntry => {
                    if (!favourites.find(fav => fav.id === mediaListEntry.id)) {
                        favourites.push({
                            name: mediaListEntry.title,
                            image: mediaListEntry.albumArtURI,
                            id: mediaListEntry.id,
                            class: mediaListEntry.class
                        })
                    }
                });
                this.setState({
                    favourites: favourites
                })
            })
    }

    setMute() {
        this.raumkernelHelper.setMute(this.getSelectedZone(), !this.state.nowPlaying.isMuted);
    }

    playFavourite(favourite) {
        this.raumkernelHelper.playFavourite(this.getSelectedZone(), favourite.id, favourite.class);
    }

    setZone(zone) {
        this.setState({selectedZoneUdn: zone.udn})
        localStorage.selectedZoneName = zone.name;
        this.loadNowPlaying(zone);
    }

    setVolume(targetVolume) {
        console.log('NOW NEED TO SET VOLUME TO ', targetVolume);
        this.raumkernelHelper.setVolume(this.getSelectedZone(), targetVolume)
    }

    setPause() {
        this.raumkernelHelper.setPause(this.getSelectedZone(), this.state.nowPlaying.isPlaying);
    }

    render() {
        console.log('RENDERING, state is: ', this.state);

        const shouldRender = this.state.isReady && this.state.nowPlaying;
        return (
            <div className="app">
                <ErrorBoundary>
                    {shouldRender ?
                        <MenuBarContainer availableZones={this.state.availableZones}
                                          nowPlaying={this.state.nowPlaying}
                                          selectedZoneUdn={this.state.selectedZoneUdn}
                                          setZone={this.setZone.bind(this)}
                                          setVolume={this.setVolume.bind(this)}
                                          setMute={this.setMute.bind(this)}
                                          favourites={this.state.favourites}
                                          setPause={this.setPause.bind(this)}
                                          playFavourite={this.playFavourite.bind(this)}
                        /> : <div className="loading">
                            App is not ready yet.
                        </div>}
                </ErrorBoundary>
            </div>
        );
    }
}


export default App;
class RaumkernelHelper {
    constructor(raumkernel) {
        this.raumkernel = raumkernel;
    }

    getAvailableZones(combinedZoneState) {
        const zones = combinedZoneState.zones;

        let availableZones = [];

        zones.forEach((zone) => {
            const zoneObj = {
                name: zone.name,
                udn: zone.udn,
                isZone: zone.isZone
            }

            const nowPlaying = this.getNowPlayingStateForZoneObj(zoneObj);
            zoneObj.isPlaying = !!nowPlaying.isPlaying;

            availableZones.push(zoneObj);
        });

        availableZones.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

        return availableZones;
    }

    /**
     * @deprecated
     */
    async getAutoSelectZone(availableZones) {

        const getNowPlayingStateMap = () => {
            let nowPlayingStates = new Map();

            for (const zone of availableZones) {
                nowPlayingStates.set(zone, this.getNowPlayingStateForZoneObj(zone));
            }

            return nowPlayingStates;
        }

        // todo: Here is a bug: _combinedStateData for some reason changes while we are using it.
        // "rendererState" is only filled after some time which causes AutoselectZone to fail.
        // setting a timeout helps here.

        let getNowPlayingStateMapPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(getNowPlayingStateMap())
            }, 2)
        });

        let nowPlayingStateMap = await getNowPlayingStateMapPromise;

        let autoselectZone = null;
        nowPlayingStateMap.forEach((value, key) => {
            if (!autoselectZone && (value.isPlaying || value.isLoading)) {
                autoselectZone = key;
            }
        });

        if (!autoselectZone) {
            autoselectZone = availableZones[0];
            console.log('DID NOT FIND A ZONE FOR AUTOSELECT, NOW TAKING ', autoselectZone);
        }

        return autoselectZone;
    }

    getNowPlayingStateForZoneObj(zone) {
        const mediaRenderer = this.getRendererForZoneObj(zone);

        const metaDataXML = mediaRenderer && (mediaRenderer.rendererState.CurrentTrackMetaData || mediaRenderer.rendererState.AVTransportURIMetaData);
        let metaData = this.getMetaDataforXML(metaDataXML);

        return {
            artist: metaData.artist,
            track: metaData.track,
            image: metaData.image,
            isPlaying: mediaRenderer && mediaRenderer.rendererState.TransportState === "PLAYING",
            isLoading: mediaRenderer && mediaRenderer.rendererState.TransportState === "TRANSITIONING",
            isMuted: mediaRenderer && mediaRenderer.rendererState.Mute === 1,
            volume: mediaRenderer && parseInt(mediaRenderer.rendererState.Volume)
        }
    }

    getRendererForZoneObj(zone) {
        let mediaRenderer = null;

        if (!zone.isZone) {
            const rendererUDNs = this.raumkernel.managerDisposer.zoneManager.getRendererUdnsForRoomUdnOrName(zone.udn);
            const rendererUDN = rendererUDNs[0]; // todo: Check if this leads to an error if multiple devices in one room.

            mediaRenderer = this.raumkernel.managerDisposer.deviceManager.mediaRenderers.get(rendererUDN);
        } else {
            mediaRenderer = this.raumkernel.managerDisposer.deviceManager.mediaRenderersVirtual.get(zone.udn);
        }

        return mediaRenderer;
    }

    getMetaDataforXML(AVTransportURIMetaData) {
        const result = {
            track: 'Nothing currently playing',
            image: '',
            artist: '',
            album: '',
            classString: ''
        }

        if (AVTransportURIMetaData) {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(AVTransportURIMetaData, "text/xml");

            const hasRelevantContent = xmlDoc.getElementsByTagName('upnp:class').length > 0;
            if (!hasRelevantContent) {
                return result;
            }

            const classStringNode = xmlDoc.getElementsByTagName('upnp:class')[0];
            const trackNode = xmlDoc.getElementsByTagName('dc:title')[0]
            const imageNode = xmlDoc.getElementsByTagName('upnp:albumArtURI')[0]

            result.classString = classStringNode && classStringNode.childNodes[0].nodeValue;
            result.track = trackNode && trackNode.childNodes[0].nodeValue;
            result.image = imageNode && imageNode.childNodes[0].nodeValue;

            if (result.classString === 'object.item.audioItem.musicTrack') {
                const artistNode = xmlDoc.getElementsByTagName('upnp:artist')[0];
                const albumNode = xmlDoc.getElementsByTagName('upnp:album')[0];

                result.artist = artistNode && artistNode.childNodes[0].nodeValue;
                result.album = albumNode && albumNode.childNodes[0].nodeValue;
            }
        }

        return result;
    }

    setPause(zone, shouldPause) {
        let renderer = this.getRendererForZoneObj(zone);
        if (!renderer) {
            console.log('Could not load zone renderer for UDN ', zone);
        }
        return shouldPause ? renderer.pause() : renderer.play();
    }

    setMute(zone, shouldMute) {
        let renderer = this.getRendererForZoneObj(zone);
        if (!renderer) {
            console.log('Could not load zone renderer for UDN ', zone);
        }
        return renderer.setMute(shouldMute);
    }

    setVolume(zone, targetVolume) {
        let renderer = this.getRendererForZoneObj(zone);
        if (!renderer) {
            console.log('Could not load zone renderer for UDN ', zone);
            return;
        }
        return renderer.setVolume(targetVolume);
    }

    async playFavourite(zone, id, classType) {
        //let zoneRenderer = this.raumkernel.managerDisposer.deviceManager.mediaRenderersVirtual.get(udn);

        let zoneRenderer = await this.getOrCreateRendererForZoneOrRoomUDN(zone)

        this.leaveStandby(zoneRenderer).then((amountOfRenderersLeftStandby) => {
            if (classType.startsWith('object.container')) {
                zoneRenderer.loadContainer(id);
            } else if (classType.startsWith('object.item')) {
                zoneRenderer.loadSingle(id);
            } else {
                alert(`Playback of ${classType} not implemented yet.`);
            }
        })
    }

    async getOrCreateRendererForZoneOrRoomUDN(zone) {
        let zoneUDN = null;
        if (!zone.isZone) {
            //create a new zone
            await this.raumkernel.managerDisposer.zoneManager.connectRoomToZone(zone.udn, '', true);
            zoneUDN = this.raumkernel.managerDisposer.zoneManager.getZoneUDNFromRoomUDN(zone.udn);
        } else {
            zoneUDN = zone.udn;
        }

        let mediaRenderer = this.raumkernel.managerDisposer.deviceManager.mediaRenderersVirtual.get(zoneUDN);

        if (!mediaRenderer) {
            //todo: Is this really possible if we check for zone before?
            //todo: leagacy code, potentially remove.
            mediaRenderer = this.raumkernel.managerDisposer.deviceManager.mediaRenderers.get(zone.udn);
            console.log('tried to get non-virtual renderer for udn. ', zone.udn, mediaRenderer);
        }

        if (!mediaRenderer) {
            //todo: Is this really possible if we check for zone before?
            //todo: leagacy code, potentially remove.
            console.log('Could not load zone renderer for UDN ', zone.udn);
        }

        return mediaRenderer;

    }

    async leaveStandby(_mediaRendererVirtual) {
        let resultSum = [];
        let rendererUDNs = _mediaRendererVirtual.getRoomRendererUDNs();

        for (const rendererUDN of rendererUDNs) {
            let mediaRendererRoom = this.raumkernel.managerDisposer.deviceManager.getMediaRenderer(rendererUDN);
            if (mediaRendererRoom) {
                try {
                    let result = await mediaRendererRoom.leaveStandby(true);
                    resultSum.push(result);
                } catch (_exception) {
                    // we may get exceptions for devices which do not have a standby mode so catch the error
                    // but do not stop the code running!
                    console.error(_exception.toString());
                }
            }
        }

        return resultSum;
    }

}

export default RaumkernelHelper;
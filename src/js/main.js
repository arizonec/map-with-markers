import '../index.html';
import '../assets/styles/style.scss';

const button = document.querySelector('.input-bnt');
const inputType = document.querySelector('.input-type');
const inputName = document.querySelector('.input-name');
const inputAbout = document.querySelector('.input-about');
const itemsList = document.querySelector('.items-list');

let map;
const x = document.querySelector('.x');
const y = document.querySelector('.y');

const main = async () => {
    await ymaps.ready(() => {
        map = new ymaps.Map("map", {
            center: [60.3913, 5.3221],
            zoom: 10,
            controls: ['typeSelector'],
        });

        // let objectManager = new ymaps.ObjectManager({ clusterize: false });

        let array = JSON.parse(localStorage.getItem('array'));

        if (array) {
            array.forEach(obj => {
                let placemark = new ymaps.Placemark([obj.xCoord, obj.yCoord], {
                    iden: obj.id,
                    hintContent: `<div class="item-hint" id="${obj.id}">
                                        <img src="${require(`../assets/images/norway.png`)}" alt="">
                                            <div class="about-item">
                                                <div class="item-name">${obj.name}</div>
                                                <div class="item-type">${obj.type}</div>
                                            <div class="item-about">${obj.about}</div>
                                        </div>
                                    </div>`,
                }, {
                    draggable: true,
                });

                map.geoObjects.add(placemark);

                // objectManager.add({
                //     type: 'Feature',
                //     id: obj.id,
                //     geometry: {
                //         type: 'Point',
                //         coordinates: [obj.xCoord, obj.yCoord],
                //     },
                //     properties: {
                //         hintContent: `<div class="item-hint" id="${obj.id}">
                //                         <img src="${require(`../assets/images/norway.png`)}" alt="">
                //                             <div class="about-item">
                //                                 <div class="item-name">${obj.name}</div>
                //                                 <div class="item-type">${obj.type}</div>
                //                             <div class="item-about">${obj.about}</div>
                //                         </div>
                //                     </div>`,
                //     }
                // });

                placemark.events.add('dragend', function (e) {
                    let coords = e.get('target').properties;
                });
            })
        }

        const getGeo = (e) => {
            let coords = e.get('coords');
            let storedCoords = [coords[0], coords[1]];

            x.innerHTML = storedCoords[0];
            y.innerHTML = storedCoords[1];

        }

        const showItemOnMap = (e) => {
            const parent = e.target;
            let array = JSON.parse(localStorage.getItem('array'));
            const point = array.find(item => item.id == parent.closest('.item').id);
            if (point) {
                map.setCenter([point.xCoord, point.yCoord]);
            }
        }

        const deleteItem = (e) => {
            if (e.target.classList.contains('item-button-delete')) {
                const parent = e.target;
                let array = JSON.parse(localStorage.getItem('array'));
                map.geoObjects.each(geoObject => {
                    if (geoObject.properties.get('iden') == parent.closest('.item').id) {
                        map.geoObjects.remove(geoObject);
                    }
                });
                const filteredArray = array.filter(item => item.id != parent.closest('.item').id);
                localStorage.setItem('array', JSON.stringify(filteredArray));
                renderList();
                main();
                // objectManager.remove([parent.closest('.item').id]);
            }
        }

        const createMarker = () => {
            let name;
            let type;
            let about;

            if (inputType.value) {
                type = inputType.value;
            }
            if (inputName.value) {
                name = inputName.value;
            }
            if (inputAbout.value) {
                about = inputAbout.value;
            }

            let xCoord = x.innerHTML;
            let yCoord = y.innerHTML;

            const id = Date.now();

            const obj = {
                id,
                name,
                type,
                about,
                xCoord,
                yCoord,
            }

            const oldArray = JSON.parse(localStorage.getItem('array'));
            if (oldArray) {
                oldArray.push(obj);
                localStorage.setItem('array', JSON.stringify(oldArray));
            } else {
                localStorage.setItem('array', JSON.stringify([]));
            }

            let placemark = new ymaps.Placemark([obj.xCoord, obj.yCoord], {
                iden: obj.id,
            }, {
                draggable: true,
            });

            map.geoObjects.add(placemark);

            renderList();
        }

        // map.geoObjects.add(objectManager);
        map.events.add('click', getGeo);
        map.cursors.push('arrow');
        itemsList.addEventListener('click', deleteItem);
        itemsList.addEventListener('click', showItemOnMap);
        button.addEventListener('click', createMarker);
    });
}

const renderList = () => {
    if (localStorage.length === 0) {
        localStorage.setItem('array', JSON.stringify([]));
    } else {
        const localStorageData = JSON.parse(localStorage.getItem('array'));
        itemsList.innerHTML = '';
        localStorageData.forEach(item => {
            itemsList.innerHTML += renderItem(item);
        });
    }
}

const renderItem = (obj) => {
    return `
            <div class="item" id="${obj.id}">
                <img src="${require(`../assets/images/norway.png`)}" alt="">
                <div class="about-item">
                    <div class="item-name">${obj.name}</div>
                    <div class="item-type">${obj.type}</div>
                    <div class="item-about">${obj.about}</div>
                    <div class="buttons">
                        <button class="item-button">Изменить</button>
                        <button class="item-button-delete">Удалить</button>
                    </div>
                </div>
            </div>
    `
}



document.addEventListener('DOMContentLoaded', renderList);
main();

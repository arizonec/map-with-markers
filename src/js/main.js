import '../index.html';
import '../assets/styles/style.css';

const button = document.querySelector('.input-bnt');
const inputType = document.querySelector('.input-type');
const inputName = document.querySelector('.input-name');
const inputColor = document.querySelector('.input-color');
const inputAbout = document.querySelector('.input-about');
const itemsList = document.querySelector('.items-list');
const search = document.querySelector('.search');

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

        let array = JSON.parse(localStorage.getItem('array'));

        if (array) {
            array.forEach(obj => {
                let placemark = new ymaps.Placemark([obj.xCoord, obj.yCoord, obj.color], {
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
                    preset: `islands#${obj.color}Icon`,
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
            if (!e.target.classList.contains('item-button')) {
                const parent = e.target;
                let array = JSON.parse(localStorage.getItem('array'));

                const point = array.find(item => item.id == parent.closest('.item').id);
                if (point) {
                    map.setCenter([point.xCoord, point.yCoord]);
                }
                map.geoObjects.each(geoObject => {
                    if (geoObject.properties.get('iden') == parent.closest('.item').id) {
                        geoObject.options.set('preset', `islands#${point.color}Icon`);
                    } else if (geoObject.properties.get('iden') != parent.closest('.item').id) {
                        geoObject.options.set('preset', 'islands#grayIcon');
                    }
                });
            }
        }

        const deleteItem = (e) => {
            if (e.target.classList.contains('item-button-delete')) {
                const parent = e.target;
                let array = JSON.parse(localStorage.getItem('array'));
                const filteredArray = array.filter(item => item.id != parent.closest('.item').id);
                localStorage.setItem('array', JSON.stringify(filteredArray));
                renderList();
                map.geoObjects.each(geoObject => {
                    if (geoObject.properties.get('iden') == parent.closest('.item').id) {
                        map.geoObjects.remove(geoObject);
                    }
                });

            }
        }

        const createMarker = (e) => {
            let name;
            let type;
            let about;
            let color;


            if (inputType.value !== '' && inputName.value !== '' && inputAbout.value !== '') {
                type = inputType.value;
                name = inputName.value;
                about = inputAbout.value;
                color = inputColor.value.length > 0 ? inputColor.value : 'green';
            } else {
                alert('Заполните все поля!!!')
                return;
            }

            let xCoord;
            let yCoord;

            if (x.innerHTML.length > 5 && y.innerHTML.length > 5) {
                xCoord = x.innerHTML;
                yCoord = y.innerHTML;
            } else {
                alert('Выберите точку на карте!!!')
                return;
            }

            const id = Date.now();

            const obj = {
                id,
                name,
                type,
                about,
                color,
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

            let placemark = new ymaps.Placemark([obj.xCoord, obj.yCoord, obj.color], {
                iden: obj.id,
            }, {
                draggable: true,
                // preset: 'islands#greenIcon',
                preset: `islands#${color}Icon`,
            });

            map.geoObjects.add(placemark);

            renderList();
        }

        const searchArray = () => {
            const localStorageData = JSON.parse(localStorage.getItem('array'));
            const filteredData = localStorageData.filter(item => item.name.toLowerCase().slice(0, search.value.length) === search.value.toLowerCase());

            itemsList.innerHTML = '';
            filteredData.forEach(item => {
                itemsList.innerHTML += renderItem(item);
            });
        }

        //Тут должен быть фильтр маркеров, был близок, но не вышло:(
        // const searchArray = () => {
        //     const localStorageData = JSON.parse(localStorage.getItem('array'));
        //     const searchValue = search && search.value ? search.value.toLowerCase() : '';
        //     const filteredData = localStorageData.filter(item => item.name.toLowerCase().slice(0, search.value.length) === search.value.toLowerCase());

        //     map.geoObjects.each((geoObject) => {
        //         const geoObjectName = geoObject.properties.get('name');
        //         const found = geoObjectName && geoObjectName.toLowerCase() === searchValue;
        //         if (found) {
        //             geoObject.options.set('visible', true);  // Show marker
        //         } else {
        //             geoObject.options.set('visible', false);  // Hide marker
        //         }
        //     });

        //     itemsList.innerHTML = '';
        //     filteredData.forEach(item => {
        //         itemsList.innerHTML += renderItem(item);
        //     });
        // };



        // map.geoObjects.add(objectManager);
        map.events.add('click', getGeo);
        map.cursors.push('arrow');
        itemsList.addEventListener('click', deleteItem);
        itemsList.addEventListener('click', showItemOnMap);
        button.addEventListener('click', createMarker);
        search.addEventListener('keyup', searchArray);
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

const editItem = (e) => {
    const elem = e.target;
    if (e.target.classList.contains('item-button')) {
        const parent = elem.closest('.item');
        const itemNameInput = document.createElement('input');
        itemNameInput.classList.add('item-name-edit');
        itemNameInput.value = parent.querySelector('.item-name').innerHTML;
        parent.querySelector('.item-name').innerHTML = '';
        parent.querySelector('.item-name').appendChild(itemNameInput);

        const itemTypeInput = document.createElement('input');
        itemTypeInput.classList.add('item-type-edit');
        itemTypeInput.value = parent.querySelector('.item-type').innerHTML;
        parent.querySelector('.item-type').innerHTML = '';
        parent.querySelector('.item-type').appendChild(itemTypeInput);

        const itemAboutInput = document.createElement('input');
        itemAboutInput.classList.add('item-about-edit');
        itemAboutInput.value = parent.querySelector('.item-about').innerHTML;
        parent.querySelector('.item-about').innerHTML = '';
        parent.querySelector('.item-about').appendChild(itemAboutInput);

        const saveButton = document.createElement('button');
        saveButton.classList.add('saved');
        saveButton.textContent = 'Save';
        parent.querySelector('.buttons').innerHTML = '';
        parent.querySelector('.buttons').appendChild(saveButton);

        const localStorageData = JSON.parse(localStorage.getItem('array'));
        const obj = localStorageData.find(item => item.id == parent.id);

        saveButton.addEventListener('click', () => {
            obj.name = itemNameInput.value;
            obj.type = itemTypeInput.value;
            obj.about = itemAboutInput.value;
            localStorage.setItem('array', JSON.stringify(localStorageData));
            renderList();
        });
    }
}

itemsList.addEventListener('click', editItem);
document.addEventListener('DOMContentLoaded', renderList);
main();






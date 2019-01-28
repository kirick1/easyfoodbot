interface ObjectWithTitle {
  title: string
}

export default class Util {
  static objectsArrayToMapByTitle (objectsArray: Array<ObjectWithTitle> = []) {
    const map = new Map()
    if (objectsArray.length === 0) return map
    for (const object of objectsArray) map.set(object.title, object)
    return map
  }
}

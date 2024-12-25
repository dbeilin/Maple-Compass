import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

interface MapModalProps {
  imageUrl: string
  mapName: string
  className?: string
}

export function MapModal({ imageUrl, mapName, className }: MapModalProps) {
  return (
    <Zoom>
      <img
        src={imageUrl}
        alt={mapName}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Zoom>
  )
}

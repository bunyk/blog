import {Typography} from '@material-ui/core'

export default function Footer() {
    return <Typography variant="body2" color="textSecondary" align="center">
      © {new Date().getFullYear()} Bunyk Taras. Built with Material UI & Next.js
    </Typography>
}

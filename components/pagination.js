import {Button} from '@material-ui/core'
import LinkButton from './linkbutton'

export default function Pagination({page, count, pageURL}) {
    const buttons = [];
    for(var i=1; i<=count; i++) {
        buttons.push(<LinkButton href={pageURL(i)} disabled={i==page} key={i}>
            {i}
        </LinkButton>)
    }
    return <>
        {buttons}
    </>
}

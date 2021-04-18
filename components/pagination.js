import {Button} from '@material-ui/core'
import LinkButton from './linkbutton'

export default function Pagination({page, count}) {
    const buttons = [];
    for(var i=1; i<=count; i++) {
        const variant="";
        buttons.push(<LinkButton href={`/page/${i}/`} disabled={i==page} key={i}>
            {i}
        </LinkButton>)
    }

    return <>
        {buttons}
    </>
}

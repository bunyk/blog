import Link from 'next/link'
import {Button} from '@material-ui/core'

export default function LinkButton({href, children, disabled}) {
    if(disabled) {
        return <Button disabled>{children}</Button>
    }
    return <Link
        href={href}
        passHref>
        <Button component="a">
            {children}
        </Button>
    </Link>
}
